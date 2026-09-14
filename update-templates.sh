#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATES_DIR="$SCRIPT_DIR/templates"
# Compiler/engine upgrades need a deliberate compatibility review, including PCF.
PROTECTED_PACKAGES="typescript,@typescript/native,oxlint-tsgolint"

# Source and dependencies for shadcn must be refreshed together by its pinned CLI.
while IFS= read -r -d '' patch_file; do
    if [[ "$patch_file" == "$TEMPLATES_DIR/ui/shadcn-ui/package.patch.json" ]]; then
        continue
    fi
    echo "Updating $patch_file"
    npx npm-check-updates@latest -u --target minor --reject "$PROTECTED_PACKAGES" --packageFile "$patch_file"
done < <(find "$TEMPLATES_DIR" -type d -name node_modules -prune -o -type f -name package.patch.json -print0)

# Layers are merged by the generator; never install dependencies into template folders.
while IFS= read -r -d '' package_file; do
    echo "Updating $package_file"
    npx npm-check-updates@latest -u --target minor --reject "$PROTECTED_PACKAGES" --packageFile "$package_file"
    (cd "$(dirname "$package_file")" && npm install --package-lock-only --ignore-scripts)
done < <(find "$TEMPLATES_DIR" -type d -name node_modules -prune -o -type f -name package.json -print0)

echo "Dependency files updated. Review the diff and run npm run build:generated."
echo "Refresh shadcn separately with npm run refresh:shadcn-template."
