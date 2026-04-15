import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import { applyLayer, replaceTokensRecursively } from "./libFunctions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const RUNTIME_TYPES_TEMPLATE = `export interface PcfWebApi {
\tretrieve<T = Record<string, unknown>>(entitySet: string, id: string, query?: string): Promise<T>;
\tretrieveMultiple<T = Record<string, unknown>>(entitySet: string, query?: string): Promise<T[]>;
\tcreate<T = unknown>(entitySet: string, data: unknown): Promise<T>;
\tupdate(entitySet: string, id: string, data: unknown): Promise<void>;
}

export interface PcfRuntimeContext {
\thost: "pcf";
\trecordId: string | null;
\tentityName: string | null;
\tclientUrl: string | null;
\tuserId: string | null;
\twebApi: PcfWebApi;
}
`;

export interface PcfCliOptions {
	pcfDir: string;
	constructor?: string | undefined;
	description?: string | undefined;
	displayName?: string | undefined;
	dist?: string | undefined;
	layers?: string[] | undefined;
	namespace?: string | undefined;
	output?: string | undefined;
	packageName?: string | undefined;
	template?: string | undefined;
	version?: string | undefined;
}

export async function generatePcfFromExistingWebresource(
	options: PcfCliOptions,
): Promise<{
	constructorName: string;
	namespace: string;
	outputDir: string;
	templateDir: string;
}> {
	const projectDir = path.resolve(process.cwd(), options.pcfDir);
	const packageJson = await readJson(path.join(projectDir, "package.json"));
	const folderName = path.basename(projectDir);
	const packageName =
		typeof packageJson?.name === "string" ? packageJson.name : folderName;
	const displayName = toDisplayName(folderName);
	const constructorName =
		options.constructor ??
		`${toPascalCase(packageName.replace(/[^a-z0-9]+/gi, " "))}Host`;
	const namespace = options.namespace ?? "EC";
	const version = options.version ?? "1.0.0";
	const distDirName = options.dist ?? "dist";
	const outputDir = path.resolve(
		projectDir,
		options.output ?? path.join("pcf", constructorName),
	);
	const templateDir = path.resolve(
		options.template ?? path.join(__dirname, "..", "templates", "pcf", "base"),
	);
	const layerDirs = (options.layers ?? []).map((layerDir) =>
		path.resolve(projectDir, layerDir),
	);
	const controlDisplayName = options.displayName ?? `${displayName} Host`;
	const controlDescription =
		options.description ??
		`PCF wrapper that renders the ${displayName} React app directly inside a PCF control.`;
	const packageNameToken =
		options.packageName ?? toKebabCase(constructorName);

	const relToProject = toPosixPath(path.relative(outputDir, projectDir) || ".");
	const appImportPath = ensureRelativeImport(
		toPosixPath(path.relative(outputDir, path.join(projectDir, "src", "App"))),
	);
	const runtimeTypesImportPath = ensureRelativeImport(
		toPosixPath(
			path.relative(outputDir, path.join(projectDir, "src", "runtime", "types")),
		),
	);
	const cssImportPath = ensureRelativeImport(
		toPosixPath(
			path.relative(outputDir, path.join(projectDir, distDirName, "main.css")),
		),
	);

	await assertFileExists(
		path.join(projectDir, "src", "App.tsx"),
		`Could not find src/App.tsx in ${projectDir}.`,
	);
	await assertFileExists(
		path.join(projectDir, distDirName, "main.css"),
		`Could not find ${distDirName}/main.css in ${projectDir}. Run the webresource build first.`,
	);

	await ensureRuntimeTypes(projectDir);

	await fs.remove(outputDir);
	await applyLayer(templateDir, outputDir);
	for (const layerDir of layerDirs) {
		await applyLayer(layerDir, outputDir);
	}

	await replaceTokensRecursively(outputDir, {
		CONTROL_DESCRIPTION: controlDescription,
		CONTROL_DISPLAY_NAME: controlDisplayName,
		PCF_CONSTRUCTOR: constructorName,
		PCF_NAMESPACE: namespace,
		PCF_PACKAGE_NAME: packageNameToken,
		PCF_VERSION: version,
		PROJECT_APP_IMPORT: appImportPath,
		PROJECT_CSS_IMPORT: cssImportPath,
		PROJECT_NODE_MODULES_TYPES_ROOT: `${relToProject}/node_modules/@types`,
		PROJECT_REACT_ALIAS: `${relToProject}/node_modules/react`,
		PROJECT_REACT_DOM_ALIAS: `${relToProject}/node_modules/react-dom`,
		PROJECT_ROOT_REL: relToProject,
		PROJECT_RUNTIME_TYPES_IMPORT: runtimeTypesImportPath,
		PROJECT_SRC_ALIAS: `${relToProject}/src`,
	});

	await renameIfExists(
		path.join(outputDir, "ControlHost.pcfproj"),
		path.join(outputDir, `${constructorName}.pcfproj`),
	);

	return {
		constructorName,
		namespace,
		outputDir,
		templateDir,
	};
}

async function ensureRuntimeTypes(projectDir: string): Promise<void> {
	const runtimeTypesPath = path.join(projectDir, "src", "runtime", "types.ts");
	if (await fs.pathExists(runtimeTypesPath)) {
		return;
	}

	await fs.ensureDir(path.dirname(runtimeTypesPath));
	await fs.writeFile(runtimeTypesPath, RUNTIME_TYPES_TEMPLATE, "utf8");
}

async function readJson(filePath: string): Promise<Record<string, unknown> | null> {
	try {
		return await fs.readJson(filePath);
	} catch {
		return null;
	}
}

async function renameIfExists(fromPath: string, toPath: string): Promise<void> {
	if (!(await fs.pathExists(fromPath))) {
		return;
	}

	await fs.move(fromPath, toPath, { overwrite: true });
}

async function assertFileExists(
	filePath: string,
	message: string,
): Promise<void> {
	if (!(await fs.pathExists(filePath))) {
		throw new Error(message);
	}
}

function toPascalCase(value: string): string {
	return value
		.split(/[^a-z0-9]+/i)
		.filter(Boolean)
		.map((part) => part[0]?.toUpperCase() + part.slice(1).toLowerCase())
		.join("");
}

function toKebabCase(value: string): string {
	return value
		.replace(/([a-z0-9])([A-Z])/g, "$1-$2")
		.replace(/[^a-z0-9]+/gi, "-")
		.replace(/^-+|-+$/g, "")
		.toLowerCase();
}

function toDisplayName(value: string): string {
	return value.replace(/[._-]+/g, " ").replace(/\s+/g, " ").trim();
}

function toPosixPath(value: string): string {
	return value.split(path.sep).join("/");
}

function ensureRelativeImport(value: string): string {
	if (value.startsWith(".")) {
		return value;
	}

	return `./${value}`;
}
