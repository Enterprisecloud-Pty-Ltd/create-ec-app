import path from "node:path";
import fs from "fs-extra";
import {
	mergeJson,
	readJsonIfExists,
	type JsonObject,
} from "./libFunctions.js";
import { localizeShadcnPortals } from "./portalContainers.js";

const SHADCN_SETUP_DEPENDENCIES: Readonly<Record<string, string>> = {
	shadcn: "4.12.0",
};

const TARGET_PREFIXES: ReadonlyArray<[string, string]> = [
	["@components/", "src/components"],
	["@ui/", "src/components/ui"],
	["@lib/", "src/lib"],
	["@hooks/", "src/hooks"],
];

interface RegistryCatalog {
	name: string;
	items: Array<{ name: string }>;
}

interface RegistryItem {
	dependencies: string[];
	devDependencies: string[];
	files: RegistryFile[];
	css?: RegistryCssObject;
	cssVars?: RegistryCssVars;
}

interface RegistryFile {
	path: string;
	content: string;
	target?: string;
}

type RegistryCssValue = string | number | RegistryCssObject;
interface RegistryCssObject {
	[key: string]: RegistryCssValue;
}
type RegistryCssVars = Record<"theme" | "light" | "dark", Record<string, string>>;

export interface CustomShadcnRegistryOptions {
	projectDir: string;
	registryUrl: string;
	templateDir: string;
}

export async function applyCustomShadcnRegistry({
	projectDir,
	registryUrl,
	templateDir,
}: CustomShadcnRegistryOptions): Promise<void> {
	const normalizedRegistryUrl = normalizeRegistryUrl(registryUrl);

	await copyShadcnSetup(templateDir, projectDir);

	const catalog = parseRegistryCatalog(
		await fetchJson(normalizedRegistryUrl),
		normalizedRegistryUrl,
	);
	const items = await Promise.all(
		catalog.items.map(({ name }) =>
			fetchRegistryItem(normalizedRegistryUrl, name),
		),
	);

	await writeRegistryFiles(projectDir, items);
	await mergePackageDependencies(projectDir, items);
	await applyRegistryStyles(projectDir, items);
	await writeRegistryNamespace(projectDir, catalog.name, normalizedRegistryUrl);
	await localizeShadcnPortals(projectDir);
}

export function normalizeRegistryUrl(value: string): string {
	let url: URL;
	try {
		url = new URL(value.trim());
	} catch (error) {
		throw new Error(`Invalid shadcn registry URL "${value}".`, {
			cause: error,
		});
	}

	if (url.protocol !== "http:" && url.protocol !== "https:") {
		throw new Error(
			`Unsupported shadcn registry URL "${value}". Use an http or https URL.`,
		);
	}

	if (url.pathname.endsWith("/registry.json")) {
		return url.toString();
	}

	throw new Error(
		`Unsupported shadcn registry URL "${value}". Use a registry.json URL, for example https://example.com/r/registry.json.`,
	);
}

export function parseDependencySpecifier(
	specifier: string,
): [name: string, version: string] {
	const value = specifier.trim();
	if (value.length === 0) {
		throw new Error("Dependency specifier cannot be empty.");
	}

	const versionIndex = value.startsWith("@")
		? value.indexOf("@", 1)
		: value.indexOf("@");

	if (versionIndex === -1) {
		return [value, "*"];
	}

	const name = value.slice(0, versionIndex);
	const version = value.slice(versionIndex + 1);
	if (name.length === 0 || version.length === 0) {
		throw new Error(`Invalid dependency specifier "${specifier}".`);
	}

	return [name, version];
}

export function resolveRegistryTargetPath(
	projectDir: string,
	target: string,
): string {
	const relativePath = toProjectRelativePath(target);
	if (path.isAbsolute(relativePath)) {
		throw new Error(`Registry target "${target}" must be relative.`);
	}

	const outputPath = path.resolve(projectDir, relativePath);
	const relativeToProject = path.relative(projectDir, outputPath);
	if (relativeToProject.startsWith("..") || path.isAbsolute(relativeToProject)) {
		throw new Error(`Registry target "${target}" escapes the project directory.`);
	}

	return outputPath;
}

export function toRegistryItemUrl(registryUrl: string, itemName: string): string {
	return new URL(`${encodeURIComponent(itemName)}.json`, registryUrl).toString();
}

export function toRegistryItemUrlTemplate(registryUrl: string): string {
	const url = new URL(registryUrl);
	const basePath = url.pathname.endsWith("/")
		? url.pathname
		: url.pathname.slice(0, url.pathname.lastIndexOf("/") + 1);

	return `${url.origin}${basePath}{name}.json${url.search}${url.hash}`;
}

export function toRegistryNamespace(registryName: string): string {
	const namespace = registryName
		.toLowerCase()
		.replace(/[^a-z0-9_-]+/g, "-")
		.replace(/^-+|-+$/g, "");

	return `@${namespace || "custom"}`;
}

async function copyShadcnSetup(
	templateDir: string,
	projectDir: string,
): Promise<void> {
	await fs.copy(
		path.join(templateDir, "components.json"),
		path.join(projectDir, "components.json"),
	);
	await fs.copy(
		path.join(templateDir, "src", "index.patch.css"),
		path.join(projectDir, "src", "index.css"),
	);
}

async function fetchRegistryItem(
	registryUrl: string,
	name: string,
): Promise<RegistryItem> {
	const itemUrl = toRegistryItemUrl(registryUrl, name);
	return parseRegistryItem(await fetchJson(itemUrl), name, itemUrl);
}

async function fetchJson(url: string): Promise<unknown> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(
			`Failed to fetch shadcn registry JSON from ${url}: ${response.status} ${response.statusText}`,
		);
	}

	const body = await response.text();
	try {
		return JSON.parse(body) as unknown;
	} catch (error) {
		throw new Error(
			`Expected shadcn registry JSON from ${url}, but the response was not valid JSON. Use a registry.json URL, for example https://example.com/r/registry.json.`,
			{ cause: error },
		);
	}
}

function parseRegistryCatalog(value: unknown, url: string): RegistryCatalog {
	if (!isObject(value) || !Array.isArray(value.items)) {
		throw new Error(`Expected a shadcn registry catalog with items in ${url}.`);
	}

	return {
		name: typeof value.name === "string" && value.name.length > 0
			? value.name
			: "custom",
		items: value.items.map((item, index) => {
			if (!isObject(item) || typeof item.name !== "string" || item.name.length === 0) {
				throw new Error(`Expected registry item ${index} in ${url} to include a name.`);
			}

			return { name: item.name };
		}),
	};
}

function parseRegistryItem(
	value: unknown,
	expectedName: string,
	url: string,
): RegistryItem {
	if (!isObject(value)) {
		throw new Error(`Expected a shadcn registry item object in ${url}.`);
	}

	const files = parseRegistryFiles(value.files, expectedName);
	const css = parseCssObject(value.css, expectedName, "css");
	const cssVars = parseCssVars(value.cssVars, expectedName);

	if (files.length === 0 && css === undefined && cssVars === undefined) {
		throw new Error(
			`Expected registry item "${expectedName}" to include files or styling.`,
		);
	}

	return {
		dependencies: readStringArray(value.dependencies, expectedName, "dependencies"),
		devDependencies: readStringArray(
			value.devDependencies,
			expectedName,
			"devDependencies",
		),
		files,
		...(css === undefined ? {} : { css }),
		...(cssVars === undefined ? {} : { cssVars }),
	};
}

function parseRegistryFiles(value: unknown, itemName: string): RegistryFile[] {
	if (value === undefined) {
		return [];
	}

	if (!Array.isArray(value)) {
		throw new Error(`Expected files for registry item "${itemName}" to be an array.`);
	}

	return value.map((file, index) => parseRegistryFile(file, itemName, index));
}

function parseRegistryFile(
	value: unknown,
	itemName: string,
	index: number,
): RegistryFile {
	if (!isObject(value)) {
		throw new Error(`Expected file ${index} for registry item "${itemName}" to be an object.`);
	}

	if (typeof value.path !== "string" || value.path.length === 0) {
		throw new Error(`Expected file ${index} for registry item "${itemName}" to include a path.`);
	}

	if (typeof value.content !== "string") {
		throw new Error(
			`Expected file "${value.path}" for registry item "${itemName}" to include content.`,
		);
	}

	if (
		value.target !== undefined &&
		(typeof value.target !== "string" || value.target.length === 0)
	) {
		throw new Error(
			`Expected file "${value.path}" for registry item "${itemName}" to include a valid target.`,
		);
	}

	return {
		path: value.path,
		content: value.content,
		...(value.target === undefined ? {} : { target: value.target }),
	};
}

function parseCssObject(
	value: unknown,
	itemName: string,
	key: "css" | "cssVars",
): RegistryCssObject | undefined {
	if (value === undefined) {
		return undefined;
	}

	if (!isObject(value)) {
		throw new Error(`Expected ${key} for registry item "${itemName}" to be an object.`);
	}

	return parseRequiredCssObject(value, itemName, key);
}

function parseRequiredCssObject(
	value: Record<string, unknown>,
	itemName: string,
	key: "css" | "cssVars",
): RegistryCssObject {
	return Object.fromEntries(
		Object.entries(value).map(([entryKey, entryValue]) => [
			entryKey,
			parseCssValue(entryValue, itemName, key),
		]),
	);
}

function parseCssValue(
	value: unknown,
	itemName: string,
	key: "css" | "cssVars",
): RegistryCssValue {
	if (typeof value === "string" || typeof value === "number") {
		return value;
	}

	if (isObject(value)) {
		return parseRequiredCssObject(value, itemName, key);
	}

	throw new Error(
		`Expected ${key} for registry item "${itemName}" to contain CSS values or nested objects.`,
	);
}

function parseCssVars(
	value: unknown,
	itemName: string,
): RegistryCssVars | undefined {
	const parsed = parseCssObject(value, itemName, "cssVars");
	if (parsed === undefined) {
		return undefined;
	}

	return {
		theme: readCssVarSection(parsed, itemName, "theme"),
		light: readCssVarSection(parsed, itemName, "light"),
		dark: readCssVarSection(parsed, itemName, "dark"),
	};
}

function readCssVarSection(
	cssVars: RegistryCssObject,
	itemName: string,
	section: "theme" | "light" | "dark",
): Record<string, string> {
	const value = cssVars[section];
	if (value === undefined) {
		return {};
	}

	if (!isRegistryCssObject(value)) {
		throw new Error(
			`Expected cssVars.${section} for registry item "${itemName}" to be an object.`,
		);
	}

	return Object.fromEntries(
		Object.entries(value).map(([key, entryValue]) => {
			if (typeof entryValue !== "string") {
				throw new Error(
					`Expected cssVars.${section}.${key} for registry item "${itemName}" to be a string.`,
				);
			}

			return [key, entryValue];
		}),
	);
}

function readStringArray(
	value: unknown,
	itemName: string,
	key: "dependencies" | "devDependencies",
): string[] {
	if (value === undefined) {
		return [];
	}

	if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
		throw new Error(`Expected ${key} for registry item "${itemName}" to be strings.`);
	}

	return value;
}

async function writeRegistryFiles(
	projectDir: string,
	items: RegistryItem[],
): Promise<void> {
	for (const item of items) {
		for (const file of item.files) {
			const outputPath = resolveRegistryTargetPath(
				projectDir,
				file.target ?? file.path,
			);
			await fs.outputFile(outputPath, file.content, "utf8");
		}
	}
}

async function mergePackageDependencies(
	projectDir: string,
	items: RegistryItem[],
): Promise<void> {
	const dependencies = new Map<string, string>(
		Object.entries(SHADCN_SETUP_DEPENDENCIES),
	);
	const devDependencies = new Map<string, string>();

	for (const item of items) {
		for (const specifier of item.dependencies) {
			dependencies.set(...parseDependencySpecifier(specifier));
		}

		for (const specifier of item.devDependencies) {
			devDependencies.set(...parseDependencySpecifier(specifier));
		}
	}

	const patch: JsonObject = {
		dependencies: toSortedJsonObject(dependencies),
	};
	if (devDependencies.size > 0) {
		patch.devDependencies = toSortedJsonObject(devDependencies);
	}

	await mergePackageJson(projectDir, patch);
}

async function applyRegistryStyles(
	projectDir: string,
	items: RegistryItem[],
): Promise<void> {
	const styles = renderRegistryStyles(items);
	if (styles.imports.length === 0 && styles.statements.length === 0) {
		return;
	}

	const cssPath = path.join(projectDir, "src", "index.css");
	const existingCss = await fs.readFile(cssPath, "utf8");
	const cssWithImports = insertCssImports(existingCss, styles.imports);

	await fs.writeFile(
		cssPath,
		appendCssStatements(cssWithImports, styles.statements),
		"utf8",
	);
}

function renderRegistryStyles(items: RegistryItem[]): {
	imports: string[];
	statements: string[];
} {
	const cssVars: RegistryCssVars = {
		theme: {},
		light: {},
		dark: {},
	};
	const imports = new Set<string>();
	const statements: string[] = [];

	for (const item of items) {
		if (item.cssVars !== undefined) {
			Object.assign(cssVars.theme, item.cssVars.theme);
			Object.assign(cssVars.light, item.cssVars.light);
			Object.assign(cssVars.dark, item.cssVars.dark);
		}

		if (item.css !== undefined) {
			const rendered = renderCssObject(item.css);
			for (const importLine of rendered.imports) {
				imports.add(importLine);
			}
			statements.push(...rendered.statements);
		}
	}

	const cssVarsStatement = renderCssVars(cssVars);
	if (cssVarsStatement !== undefined) {
		statements.unshift(cssVarsStatement);
	}

	return {
		imports: [...imports],
		statements,
	};
}

function renderCssObject(css: RegistryCssObject): {
	imports: string[];
	statements: string[];
} {
	const imports: string[] = [];
	const statements: string[] = [];

	for (const [selector, value] of Object.entries(css)) {
		const statement = renderCssRule(selector, value, 0);
		if (selector.startsWith("@import ")) {
			imports.push(statement);
		} else {
			statements.push(statement);
		}
	}

	return { imports, statements };
}

function renderCssVars(cssVars: RegistryCssVars): string | undefined {
	const statements = [
		renderCssVarBlock("@theme inline", cssVars.theme),
		renderCssVarBlock(":root", cssVars.light),
		renderCssVarBlock(".dark", cssVars.dark),
	].filter((statement): statement is string => statement !== undefined);

	return statements.length === 0 ? undefined : statements.join("\n\n");
}

function renderCssVarBlock(
	selector: string,
	values: Record<string, string>,
): string | undefined {
	const entries = Object.entries(values);
	if (entries.length === 0) {
		return undefined;
	}

	const declarations = entries
		.map(([key, value]) => `  ${toCssVariableName(key)}: ${value};`)
		.join("\n");

	return `${selector} {\n${declarations}\n}`;
}

function renderCssRule(
	selector: string,
	value: RegistryCssValue,
	indent: number,
): string {
	const prefix = "  ".repeat(indent);
	if (!isRegistryCssObject(value)) {
		return `${prefix}${selector}: ${value};`;
	}

	const entries = Object.entries(value);
	if (entries.length === 0) {
		return `${prefix}${selector};`;
	}

	const children = entries
		.map(([childSelector, childValue]) =>
			renderCssRule(childSelector, childValue, indent + 1),
		)
		.join("\n");

	return `${prefix}${selector} {\n${children}\n${prefix}}`;
}

function insertCssImports(css: string, imports: string[]): string {
	const lines = css.split("\n");
	let insertIndex = 0;
	while (insertIndex < lines.length && lines[insertIndex]?.startsWith("@import ")) {
		insertIndex += 1;
	}

	for (const importLine of imports) {
		if (!lines.includes(importLine)) {
			lines.splice(insertIndex, 0, importLine);
			insertIndex += 1;
		}
	}

	return lines.join("\n");
}

function appendCssStatements(css: string, statements: string[]): string {
	return statements.length === 0
		? ensureTrailingNewline(css)
		: `${css.trimEnd()}\n\n${statements.join("\n\n")}\n`;
}

function ensureTrailingNewline(value: string): string {
	return `${value.trimEnd()}\n`;
}

async function writeRegistryNamespace(
	projectDir: string,
	registryName: string,
	registryUrl: string,
): Promise<void> {
	const componentsPath = path.join(projectDir, "components.json");
	const componentsJson = (await readJsonIfExists(componentsPath)) as JsonObject;
	const registries = componentsJson.registries as JsonObject;
	registries[toRegistryNamespace(registryName)] =
		toRegistryItemUrlTemplate(registryUrl);
	componentsJson.registries = registries;

	await fs.writeJson(componentsPath, componentsJson, { spaces: 2 });
}

async function mergePackageJson(
	projectDir: string,
	patch: JsonObject,
): Promise<void> {
	const packagePath = path.join(projectDir, "package.json");
	const packageJson = (await readJsonIfExists(packagePath)) as JsonObject;
	await fs.writeJson(packagePath, mergeJson(packageJson, patch), { spaces: 2 });
}

function toSortedJsonObject(values: Map<string, string>): JsonObject {
	return Object.fromEntries(
		[...values.entries()].sort(([a], [b]) => a.localeCompare(b)),
	) as JsonObject;
}

function toProjectRelativePath(target: string): string {
	for (const [prefix, directory] of TARGET_PREFIXES) {
		if (target.startsWith(prefix)) {
			return path.join(directory, target.slice(prefix.length));
		}
	}

	if (target.startsWith("~/")) {
		return target.slice(2);
	}

	if (target.startsWith("@/")) {
		return path.join("src", target.slice(2));
	}

	return target;
}

function toCssVariableName(value: string): string {
	return value.startsWith("--") ? value : `--${value}`;
}

function isRegistryCssObject(value: RegistryCssValue): value is RegistryCssObject {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
