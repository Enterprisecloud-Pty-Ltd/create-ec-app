import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import {
	PCF_SCOPED_CSS_FILE,
	scopeCssForPcf,
} from "./cssScope.js";
import { applyLayer, replaceTokensRecursively } from "./libFunctions.js";
import {
	ensurePortalContainerRuntime,
	localizeShadcnPortals,
} from "./portalContainers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PCF_GENERATOR_MARKER = "create-ec-app.pcf.json";
const PCF_GENERATOR_MARKER_CONTENT = {
	generatedBy: "create-ec-app",
	kind: "pcf-wrapper",
};

const RUNTIME_TYPES_TEMPLATE = `export interface PcfWebApi {
\tretrieve<T = Record<string, unknown>>(entityType: string, id: string, query?: string): Promise<T>;
\tretrieveMultiple<T = Record<string, unknown>>(entityType: string, query?: string): Promise<T[]>;
\tcreate<T = unknown>(entityType: string, data: unknown): Promise<T>;
\tupdate(entityType: string, id: string, data: unknown): Promise<void>;
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
	controlConstructor?: string | undefined;
	description?: string | undefined;
	displayName?: string | undefined;
	dist?: string | undefined;
	force?: boolean | undefined;
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
	const hasKendoPopup = hasPackageDependency(
		packageJson,
		"@progress/kendo-react-popup",
	);
	const displayName = toDisplayName(folderName);
	let constructorName =
		options.controlConstructor ??
		`${toPascalCase(packageName.replace(/[^a-z0-9]+/gi, " "))}Host`;
	if (options.controlConstructor === undefined && /^\d/.test(constructorName)) {
		constructorName = `App${constructorName}`;
	}
	const namespace = options.namespace ?? "EC";
	const version = options.version ?? "1.0.0";
	const distDirName = options.dist ?? "dist";
	const outputDir = path.resolve(
		projectDir,
		options.output ?? path.join("pcf", constructorName),
	);
	// Resolve aliases before removing an existing output directory. It must not
	// contain the source project, even when reached through a symlink or junction.
	if (await fs.pathExists(outputDir)) {
		const [realOutputDir, realProjectDir] = await Promise.all([
			fs.realpath(outputDir),
			fs.realpath(projectDir),
		]);
		const projectFromOutput = path.relative(realOutputDir, realProjectDir);
		if (
			projectFromOutput === "" ||
			(projectFromOutput.split(path.sep)[0] !== ".." &&
				!path.isAbsolute(projectFromOutput))
		) {
			throw new Error(
				"PCF output directory cannot be the webresource project root or a directory that contains it. Choose a subdirectory such as --output pcf/MyControl.",
			);
		}
	}
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

	validatePcfOptions({
		constructorName,
		description: controlDescription,
		displayName: controlDisplayName,
		namespace,
		packageName: packageNameToken,
		version,
	});
	await assertRemovablePcfOutput(outputDir, options.force ?? false);

	const relToProject = toPosixPath(path.relative(outputDir, projectDir));
	const appImportPath = ensureRelativeImport(
		toPosixPath(path.relative(outputDir, path.join(projectDir, "src", "App"))),
	);
	const portalContainerImportPath = ensureRelativeImport(
		toPosixPath(
			path.relative(
				path.join(outputDir, "runtime"),
				path.join(projectDir, "src", "runtime", "PortalContainer"),
			),
		),
	);
	const runtimeTypesImportPath = ensureRelativeImport(
		toPosixPath(
			path.relative(outputDir, path.join(projectDir, "src", "runtime", "types")),
		),
	);
	const sourceCssPath = path.join(projectDir, distDirName, "main.css");
	const cssImportPath = ensureRelativeImport(PCF_SCOPED_CSS_FILE);

	await assertFileExists(
		path.join(projectDir, "src", "App.tsx"),
		`Could not find src/App.tsx in ${projectDir}.`,
	);
	await assertFileExists(
		sourceCssPath,
		`Could not find ${distDirName}/main.css in ${projectDir}. Run the webresource build first.`,
	);
	await assertReadablePcfLayer(templateDir, "PCF template", outputDir);
	for (const layerDir of layerDirs) {
		await assertReadablePcfLayer(layerDir, "PCF layer", outputDir);
	}

	await ensureRuntimeTypes(projectDir);
	await ensurePortalContainerRuntime(projectDir);
	await localizeShadcnPortals(projectDir, {
		includeGeneratedCompatibility: false,
	});
	const pcfCss = scopeCssForPcf(
		await fs.readFile(sourceCssPath, "utf8"),
		constructorName,
	);

	await fs.remove(outputDir);
	await applyLayer(templateDir, outputDir);
	for (const layerDir of layerDirs) {
		await applyLayer(layerDir, outputDir);
	}
	await fs.writeJson(
		path.join(outputDir, PCF_GENERATOR_MARKER),
		PCF_GENERATOR_MARKER_CONTENT,
		{ spaces: 2 },
	);
	await fs.writeFile(path.join(outputDir, PCF_SCOPED_CSS_FILE), pcfCss, "utf8");

	await replaceTokensRecursively(outputDir, {
		CONTROL_DESCRIPTION: controlDescription,
		CONTROL_DISPLAY_NAME: controlDisplayName,
		PCF_CONSTRUCTOR: constructorName,
		PCF_KENDO_POPUP_IMPORT: hasKendoPopup
			? 'import { PopupPropsContext } from "@progress/kendo-react-popup";'
			: "",
		PCF_KENDO_POPUP_PROVIDER_CLOSE: hasKendoPopup
			? "</PopupPropsContext.Provider>"
			: "",
		PCF_KENDO_POPUP_PROVIDER_OPEN: hasKendoPopup
			? '<PopupPropsContext.Provider value={(props) => ({ ...props, appendTo: portalContainer })}>'
			: "",
		PCF_NAMESPACE: namespace,
		PCF_PACKAGE_NAME: packageNameToken,
		PCF_VERSION: version,
		PROJECT_APP_IMPORT: appImportPath,
		PROJECT_CSS_IMPORT: cssImportPath,
		PROJECT_PORTAL_CONTAINER_IMPORT: portalContainerImportPath,
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

function hasPackageDependency(
	packageJson: Record<string, unknown> | null,
	packageName: string,
): boolean {
	for (const field of ["dependencies", "devDependencies"] as const) {
		const dependencies = packageJson?.[field];
		if (
			typeof dependencies === "object" &&
			dependencies !== null &&
			packageName in dependencies
		) {
			return true;
		}
	}

	return false;
}

// Tokens land in XML attributes, resx values, JSON strings, and TypeScript
// identifiers, so reject values that would corrupt the generated control.
function validatePcfOptions(values: {
	constructorName: string;
	description: string;
	displayName: string;
	namespace: string;
	packageName: string;
	version: string;
}): void {
	if (!/^[A-Za-z][A-Za-z0-9]*$/.test(values.constructorName)) {
		throw new Error(
			`Invalid PCF constructor name "${values.constructorName}". Use only letters and digits, starting with a letter.`,
		);
	}

	if (!/^[A-Za-z][A-Za-z0-9]*(?:\.[A-Za-z][A-Za-z0-9]*)*$/.test(values.namespace)) {
		throw new Error(
			`Invalid PCF namespace "${values.namespace}". Use dot-separated names with only letters and digits, each starting with a letter, such as EC.Controls.`,
		);
	}

	// The value must satisfy both npm semver and pcf-scripts' numeric version schema.
	if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(values.version)) {
		throw new Error(
			`Invalid PCF version "${values.version}". Use a numeric major.minor.patch version such as 1.0.0, without leading zeros, prerelease labels, or build metadata.`,
		);
	}

	if (
		!/^(?:@[a-z0-9][a-z0-9._~-]*\/)?[a-z0-9][a-z0-9._~-]*$/.test(
			values.packageName,
		)
	) {
		throw new Error(
			`Invalid PCF package name "${values.packageName}". Use a lowercase npm package name.`,
		);
	}

	for (const [label, value] of [
		["display name", values.displayName],
		["description", values.description],
	] as const) {
		if (/[<>&"\\\p{Cc}]/u.test(value)) {
			throw new Error(
				`Invalid PCF ${label} "${value}". It cannot contain <, >, &, ", backslashes, or control characters because it is embedded in generated XML and JSON files.`,
			);
		}
	}
}

// Only this generator-owned marker permits automatic regeneration. A normal PCF
// manifest is not sufficient because hand-maintained controls use the same path.
async function assertRemovablePcfOutput(
	outputDir: string,
	force: boolean,
): Promise<void> {
	if (!(await fs.pathExists(outputDir))) {
		return;
	}

	const entries = await fs.readdir(outputDir);
	if (entries.length === 0) {
		return;
	}

	const marker = await readJson(path.join(outputDir, PCF_GENERATOR_MARKER));
	const looksGenerated =
		marker?.generatedBy === PCF_GENERATOR_MARKER_CONTENT.generatedBy &&
		marker.kind === PCF_GENERATOR_MARKER_CONTENT.kind;
	if (looksGenerated || force) {
		return;
	}

	throw new Error(
		`PCF output directory "${outputDir}" is not empty and does not look like a generated PCF control. Use --force to overwrite it.`,
	);
}

async function assertReadablePcfLayer(
	layerDir: string,
	label: string,
	outputDir: string,
): Promise<void> {
	let stat;
	try {
		stat = await fs.stat(layerDir);
	} catch (error) {
		throw new Error(`${label} directory is not readable: ${layerDir}`, {
			cause: error,
		});
	}
	if (!stat.isDirectory()) {
		throw new Error(`${label} path is not a directory: ${layerDir}`);
	}
	try {
		await fs.readdir(layerDir);
	} catch (error) {
		throw new Error(`${label} directory is not readable: ${layerDir}`, {
			cause: error,
		});
	}

	const realLayerDir = await fs.realpath(layerDir);
	const realOutputDir = (await fs.pathExists(outputDir))
		? await fs.realpath(outputDir)
		: outputDir;
	const layerFromOutput = path.relative(realOutputDir, realLayerDir);
	if (
		layerFromOutput === "" ||
		(layerFromOutput.split(path.sep)[0] !== ".." &&
			!path.isAbsolute(layerFromOutput))
	) {
		throw new Error(
			`${label} directory cannot be the PCF output directory or inside it: ${layerDir}`,
		);
	}
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
