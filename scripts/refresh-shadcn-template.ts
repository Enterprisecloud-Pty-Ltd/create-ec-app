import { execFileSync } from "node:child_process";
import os from "node:os";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import { localizeShadcnPortals } from "../src/portalContainers.ts";

const SHADCN_CLI_VERSION = "4.21.0";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const TEMPLATE_DIR = path.join(REPO_ROOT, "templates", "ui", "shadcn-ui");
const BASE_TEMPLATE_DIR = path.join(REPO_ROOT, "templates", "base");
const KEEP_TEMP = process.argv.includes("--keep-temp");
const SHADCN_UTILS_TEMPLATE = `export { cn } from "cn";\n`;
const FALLBACK_DEPENDENCY_VERSIONS: Record<string, string> = {
	"class-variance-authority": "0.7.1",
	cn: "0.2.5",
	"lucide-react": "1.41.0",
	"radix-ui": "1.6.7",
	shadcn: SHADCN_CLI_VERSION,
};
const FALLBACK_DEV_DEPENDENCY_VERSIONS: Record<string, string> = {
	"tw-animate-css": "1.4.0",
};

type DependencySection = "dependencies" | "devDependencies";

interface PackageJson {
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
}

interface PackageLock {
	packages?: Record<string, { version?: string }>;
}

async function main() {
	const tempRoot = await fs.mkdtemp(
		path.join(os.tmpdir(), "create-ec-app-shadcn-"),
	);
	const tempProjectDir = path.join(tempRoot, "app");

	try {
		await fs.copy(BASE_TEMPLATE_DIR, tempProjectDir, {
			filter: (source) => path.basename(source) !== "node_modules",
		});
		await fs.copy(
			path.join(TEMPLATE_DIR, "components.json"),
			path.join(tempProjectDir, "components.json"),
		);
		await fs.outputFile(
			path.join(tempProjectDir, "src", "lib", "utils.ts"),
			SHADCN_UTILS_TEMPLATE,
			"utf8",
		);

		const npxBin = process.platform === "win32" ? "npx.cmd" : "npx";
		execFileSync(
			npxBin,
			[
				`shadcn@${SHADCN_CLI_VERSION}`,
				"add",
				"--all",
				"--yes",
				"--overwrite",
			],
			{ cwd: tempProjectDir, stdio: "inherit" },
		);

		await ensureShadcnTailwindImport(tempProjectDir);
		await localizeShadcnPortals(tempProjectDir);
		await copyGeneratedTemplateFiles(tempProjectDir);
		await updatePackagePatch(tempProjectDir);
		await writeMetadata();

		if (KEEP_TEMP) {
			console.log(`Kept temporary shadcn app at ${tempProjectDir}`);
		}
	} finally {
		if (!KEEP_TEMP) {
			await fs.remove(tempRoot);
		}
	}
}

async function ensureShadcnTailwindImport(projectDir: string): Promise<void> {
	const cssPath = path.join(projectDir, "src", "index.css");
	const source = await fs.readFile(cssPath, "utf8");

	if (source.includes('shadcn/tailwind.css')) {
		return;
	}

	const importLine = '@import "shadcn/tailwind.css";';
	const updated = source.includes('@import "tailwindcss";')
		? source.replace(
				'@import "tailwindcss";',
				`@import "tailwindcss";\n${importLine}`,
			)
		: `${importLine}\n${source}`;

	await fs.writeFile(cssPath, updated, "utf8");
}

async function copyGeneratedTemplateFiles(tempProjectDir: string): Promise<void> {
	const templateSrcDir = path.join(TEMPLATE_DIR, "src");
	const generatedSrcDir = path.join(tempProjectDir, "src");

	for (const relPath of ["components", "hooks", "lib", "runtime"]) {
		await fs.remove(path.join(templateSrcDir, relPath));
		const generatedPath = path.join(generatedSrcDir, relPath);
		if (await fs.pathExists(generatedPath)) {
			await fs.copy(generatedPath, path.join(templateSrcDir, relPath));
		}
	}

	await fs.copy(
		path.join(generatedSrcDir, "index.css"),
		path.join(templateSrcDir, "index.patch.css"),
	);
}

async function updatePackagePatch(tempProjectDir: string): Promise<void> {
	const basePackage = await readPackageJson(
		path.join(BASE_TEMPLATE_DIR, "package.json"),
	);
	const generatedPackage = await readPackageJson(
		path.join(tempProjectDir, "package.json"),
	);
	const packageLock = await readPackageLock(
		path.join(tempProjectDir, "package-lock.json"),
	);
	const patch: PackageJson = {};

	for (const section of [
		"dependencies",
		"devDependencies",
	] satisfies DependencySection[]) {
		const generatedDependencies = generatedPackage[section] ?? {};
		const baseDependencies = basePackage[section] ?? {};
		const diff: Record<string, string> = {};

		for (const [name, range] of Object.entries(generatedDependencies).sort(([a], [b]) => a.localeCompare(b))) {
			if (baseDependencies[name] === range) {
				continue;
			}

			diff[name] = getLockedVersion(packageLock, name) ?? stripRange(range);
		}

		if (Object.keys(diff).length > 0) {
			patch[section] = diff;
		}
	}

	const sourceImports = await collectTemplateSourceImports(
		path.join(tempProjectDir, "src"),
	);
	for (const packageName of sourceImports) {
		if (basePackage.dependencies?.[packageName]) {
			continue;
		}

		if (basePackage.devDependencies?.[packageName]) {
			continue;
		}

		if (patch.dependencies?.[packageName]) {
			continue;
		}

		if (patch.devDependencies?.[packageName]) {
			continue;
		}

		const generatedSection = findDependencySection(
			generatedPackage,
			packageName,
		);
		const fallbackSection =
			packageName in FALLBACK_DEV_DEPENDENCY_VERSIONS
				? "devDependencies"
				: "dependencies";
		const section = generatedSection ?? fallbackSection;
		const fallbackVersions =
			section === "devDependencies"
				? FALLBACK_DEV_DEPENDENCY_VERSIONS
				: FALLBACK_DEPENDENCY_VERSIONS;
		const version =
			getLockedVersion(packageLock, packageName) ??
			(generatedSection
				? stripRange(generatedPackage[generatedSection]?.[packageName] ?? "")
				: fallbackVersions[packageName]);

		if (!version) {
			throw new Error(
				`Could not determine a version for shadcn source dependency "${packageName}".`,
			);
		}

		patch[section] = {
			...(patch[section] ?? {}),
			[packageName]: version,
		};
	}

	for (const section of [
		"dependencies",
		"devDependencies",
	] satisfies DependencySection[]) {
		if (patch[section]) {
			patch[section] = Object.fromEntries(
				Object.entries(patch[section]).sort(([a], [b]) => a.localeCompare(b)),
			);
		}
	}

	await fs.writeFile(
		path.join(TEMPLATE_DIR, "package.patch.json"),
		`${JSON.stringify(patch, null, "\t")}\n`,
		"utf8",
	);
}

async function collectTemplateSourceImports(srcDir: string): Promise<Set<string>> {
	const imports = new Set<string>();
	await collectImportsFromDir(srcDir, imports);
	return imports;
}

async function collectImportsFromDir(
	dirPath: string,
	imports: Set<string>,
): Promise<void> {
	const entries = await fs.readdir(dirPath, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dirPath, entry.name);
		if (entry.isDirectory()) {
			await collectImportsFromDir(fullPath, imports);
			continue;
		}

		if (!/\.(css|ts|tsx)$/.test(entry.name)) {
			continue;
		}

		const source = await fs.readFile(fullPath, "utf8");
		for (const specifier of readImportSpecifiers(source)) {
			const packageName = toPackageName(specifier);
			if (packageName) {
				imports.add(packageName);
			}
		}
	}
}

function readImportSpecifiers(source: string): string[] {
	const specifiers: string[] = [];
	const importPattern =
		/from\s+["']([^"']+)["']|import\s+["']([^"']+)["']|@import\s+["']([^"']+)["']/g;

	for (const match of source.matchAll(importPattern)) {
		const specifier = match[1] ?? match[2] ?? match[3];
		if (specifier) {
			specifiers.push(specifier);
		}
	}

	return specifiers;
}

function toPackageName(specifier: string): string | undefined {
	if (
		specifier.startsWith(".") ||
		specifier.startsWith("@/") ||
		specifier.startsWith("#")
	) {
		return undefined;
	}

	const parts = specifier.split("/");
	if (specifier.startsWith("@")) {
		return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : specifier;
	}

	return parts[0] ?? specifier;
}

function findDependencySection(
	packageJson: PackageJson,
	packageName: string,
): DependencySection | undefined {
	if (packageJson.dependencies?.[packageName]) {
		return "dependencies";
	}

	if (packageJson.devDependencies?.[packageName]) {
		return "devDependencies";
	}

	return undefined;
}

async function writeMetadata(): Promise<void> {
	const content = `# shadcn Template Snapshot

This template contains committed shadcn component source.

Generated with:

- shadcn CLI: ${SHADCN_CLI_VERSION}
- style: radix-nova
- base color: neutral
- Tailwind: v4
- generated by: \`npm run refresh:shadcn-template\`

Normal \`create-ec-app\` scaffolding does not run \`npx shadcn\`.
To refresh this snapshot, run:

\`\`\`bash
npm run refresh:shadcn-template
\`\`\`

After refreshing, generate a test app and run a build before committing.
`;

	await fs.writeFile(path.join(TEMPLATE_DIR, "SHADCN_TEMPLATE.md"), content, "utf8");
}

async function readPackageJson(filePath: string): Promise<PackageJson> {
	const json = (await fs.readJson(filePath)) as unknown;
	if (!isPackageJson(json)) {
		throw new Error(`Expected package JSON object in ${filePath}.`);
	}

	return json;
}

async function readPackageLock(filePath: string): Promise<PackageLock> {
	if (!(await fs.pathExists(filePath))) {
		return {};
	}

	const json = (await fs.readJson(filePath)) as unknown;
	if (!isObject(json)) {
		return {};
	}

	return json as PackageLock;
}

function isPackageJson(value: unknown): value is PackageJson {
	if (!isObject(value)) {
		return false;
	}

	return (
		isOptionalDependencyRecord(value.dependencies) &&
		isOptionalDependencyRecord(value.devDependencies)
	);
}

function isOptionalDependencyRecord(
	value: unknown,
): value is Record<string, string> | undefined {
	if (value === undefined) {
		return true;
	}

	if (!isObject(value)) {
		return false;
	}

	return Object.values(value).every((entry) => typeof entry === "string");
}

function getLockedVersion(
	packageLock: PackageLock,
	packageName: string,
): string | undefined {
	const entry = packageLock.packages?.[`node_modules/${packageName}`];
	return typeof entry?.version === "string" ? entry.version : undefined;
}

function stripRange(range: string): string {
	return range.replace(/^[~^]/, "");
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
