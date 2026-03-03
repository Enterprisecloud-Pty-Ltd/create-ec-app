#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATES_DIR="$SCRIPT_DIR/templates"

echo "Updating template dependencies..."

# Remove all the node_modules directories
echo "Cleaning up node_modules directories..."
find "$TEMPLATES_DIR" -maxdepth 10 -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
echo "node_modules directories removed"

# Update package.patch.json files
echo "Updating @package.patch.json files..."

find "$TEMPLATES_DIR" -maxdepth 10 -type f -name "@package.patch.json" | while read -r patch_file; do
    dir=$(dirname "$patch_file")
    echo "  Updating: $patch_file"

    # ncu can update any JSON file with dependencies structure
    (cd "$dir" && ncu -u --target minor --packageFile "@package.patch.json" 2>/dev/null) || echo "    Warning: ncu update skipped for $patch_file"
done

# Apply package.patch.json files to package.json files
echo "Applying package.patch.json updates..."

apply_patches() {
    find "$TEMPLATES_DIR" -maxdepth 10 -type f -name "@package.patch.json" | while read -r patch_file; do
        dir=$(dirname "$patch_file")
        package_file="$dir/package.json"

        if [ -f "$package_file" ]; then
            echo "  Applying patch: $patch_file"

            node -e "
                const fs = require('fs');
                const packagePath = '$package_file';
                const patchPath = '$patch_file';

                const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
                const patch = JSON.parse(fs.readFileSync(patchPath, 'utf8'));

                const mergeVersions = (target, source) => {
                    if (!source) return;
                    for (const [key, value] of Object.entries(source)) {
                        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                            target[key] = target[key] || {};
                            mergeVersions(target[key], value);
                        } else {
                            target[key] = value;
                        }
                    }
                };

                mergeVersions(pkg, patch);
                fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
                console.log('    Patched: ' + packagePath);
            "
        else
            echo "  Warning: No package.json found for patch: $patch_file"
        fi
    done
}

apply_patches

# Update dependencies in all package.json files
echo "Updating package.json dependencies..."
if ! command -v ncu &> /dev/null; then
    echo "  Installing npm-check-updates globally..."
    npm install -g npm-check-updates
fi

find "$TEMPLATES_DIR" -maxdepth 10 -type f -name "package.json" ! -path "*/node_modules/*" | while read -r pkg_file; do
    dir=$(dirname "$pkg_file")
    echo "  Updating: $pkg_file"

    (cd "$dir" && ncu -u --target minor 2>/dev/null) || echo "    Warning: ncu update skipped for $pkg_file"
done

echo "Installing dependencies and generating lock files..."
find "$TEMPLATES_DIR" -maxdepth 10 -type f -name "package.json" ! -path "*/node_modules/*" | while read -r pkg_file; do
    dir=$(dirname "$pkg_file")
    echo "  Installing: $dir"
    (cd "$dir" && npm install) || echo "    Warning: npm install failed for $dir"
done

echo "Final cleanup of node_modules directories..."
find "$TEMPLATES_DIR" -maxdepth 10 -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true

echo ""
echo "Template dependencies updated!"
echo ""
