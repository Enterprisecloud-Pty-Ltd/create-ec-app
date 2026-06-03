#!/usr/bin/env node

import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
	cancel,
	intro,
	isCancel,
	log,
	outro,
	select,
	spinner,
	text,
} from "@clack/prompts";
import fs from "fs-extra";
import { applyLayer, replaceTokensRecursively } from "./libFunctions.js";
import { generatePcfFromExistingWebresource } from "./pcf.js";

const { execSync } = await import("node:child_process");

type AppTarget = "webresource" | "portal" | "power-pages" | "swa" | "code-apps";
type UiTarget = "kendo" | "shadcn-ui";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface CliArgs {
	pcfDir?: string;
	controlConstructor?: string;
	description?: string;
	displayName?: string;
	dist?: string;
	layers?: string[];
	namespace?: string;
	output?: string;
	packageName?: string;
	template?: string;
	version?: string;
	projectName?: string;
	target?: AppTarget;
	uiType?: UiTarget;
	install?: boolean;
}

async function main() {
	const cliArgs = parseCliArgs(process.argv.slice(2));

	if (cliArgs.pcfDir) {
		const { pcfDir, ...rest } = cliArgs;
		const result = await generatePcfFromExistingWebresource({
			pcfDir,
			...stripUndefined(rest),
		});
		outro(
			`Generated PCF control at ${result.outputDir} using template ${result.templateDir}`
		);
		return;
	}

	intro("Create EC App");

	const options = await resolveScaffoldOptions(cliArgs);

	log.step(`Creating project: ${options.projectName}`);
	log.step(`Selected target: ${options.target}`);

	await scaffoldProject(options);

	outro(
		`Scaffolded ${options.projectName} as ${options.target} with ${options.uiType}. Next steps: 'git remote origin add <url>'`
	);
}

async function resolveScaffoldOptions(cliArgs: CliArgs): Promise<ScaffoldOptions> {
	const projectName = (cliArgs.projectName ?? (await promptProjectName())).trim();
	const projectNameError = validateProjectName(projectName);
	if (projectNameError) {
		throw new Error(projectNameError);
	}

	const target = cliArgs.target ?? (await promptTarget());
	const uiType = cliArgs.uiType ?? (await promptUiType());
	const shouldPromptForInstall =
		cliArgs.install === undefined &&
		(!cliArgs.projectName || !cliArgs.target || !cliArgs.uiType);
	const install = shouldPromptForInstall
		? await promptInstallDependencies()
		: cliArgs.install ?? false;

	return {
		install,
		projectName: projectName.trim(),
		target,
		uiType,
	};
}

interface ScaffoldOptions {
	install: boolean;
	projectName: string;
	target: AppTarget;
	uiType: UiTarget;
}

async function scaffoldProject({
	install,
	projectName,
	target,
	uiType,
}: ScaffoldOptions) {
	const projectDir = path.join(process.cwd(), projectName);
	const templatesRoot = path.join(__dirname, "..", "templates");

	const baseDir = path.join(templatesRoot, "base");
	const targetDir = path.join(templatesRoot, "targets", target);
	const uiDir = path.join(templatesRoot, "ui", uiType);

	await fs.copy(baseDir, projectDir);

	if (fs.existsSync(targetDir)) {
		await applyLayer(targetDir, projectDir);
	}

	if (fs.existsSync(uiDir)) {
		await applyLayer(uiDir, projectDir);
	}

	if (target === "code-apps") {
		await cleanupCodeAppsScaffold(projectDir);
	}

	await replaceTokensRecursively(projectDir, {
		APP_NAME: projectName,
		TARGET: target,
		UI: uiType,
	});

	const dependenciesInstalledByUiGenerator =
		uiType === "shadcn-ui" ? await generateShadcnUi(projectDir) : false;

	//WARN: This is a special case fix for having AuthContext in Kendo for Power Pages
	if (target === "power-pages" && uiType === "kendo") {
		const mainTsxPath = path.join(projectDir, "src", "main.tsx");
		await fs.writeFile(mainTsxPath, POWER_PAGES_KENDO_MAIN_TSX, "utf-8");
	}

	if (install && !dependenciesInstalledByUiGenerator) {
		const s = spinner();
		s.start("Running npm install...");
		const { execSync } = await import("node:child_process");
		execSync("npm install", { cwd: projectDir, stdio: "inherit" });
		s.stop("Dependencies installed.");
	}

	//INFO: npx on Windows can cause issues, so checking and creating a new gitignore
	const gitignorePath = path.join(projectDir, ".gitignore");
	if (!fs.existsSync(gitignorePath)) {
		await fs.writeFile(gitignorePath, GIT_IGNORE, "utf-8");
	}

	const sGit = spinner();
	sGit.start("Initializing git repository...");
	execSync("git init", { cwd: projectDir, stdio: "ignore" });
	execSync("git add .", { cwd: projectDir, stdio: "ignore" });
	execSync('git commit -m "Initial commit"', {
		cwd: projectDir,
		stdio: "ignore",
	});
	sGit.stop("Git repository initialized.");
}

async function generateShadcnUi(projectDir: string): Promise<boolean> {
	const s = spinner();
	s.start("Generating shadcn/ui components...");

	try {
		execSync("npx shadcn@latest add --all --yes --overwrite", {
			cwd: projectDir,
			stdio: "inherit",
		});
		s.stop("shadcn/ui components generated.");
	} catch (error) {
		s.stop("shadcn/ui component generation failed.");
		throw error;
	}

	await localizeShadcnPortals(projectDir);
	return true;
}

async function localizeShadcnPortals(projectDir: string): Promise<void> {
	const componentsDir = path.join(projectDir, "src", "components", "ui");
	if (!(await fs.pathExists(componentsDir))) {
		return;
	}

	const entries = await fs.readdir(componentsDir, { withFileTypes: true });

	for (const entry of entries) {
		if (!entry.isFile() || !entry.name.endsWith(".tsx")) {
			continue;
		}

		const filePath = path.join(componentsDir, entry.name);
		const source = await fs.readFile(filePath, "utf8");
		const updated = withGeneratedShadcnCompatibility(
			withEcPortalContainers(source, filePath),
		);

		if (updated !== source) {
			await fs.writeFile(filePath, updated, "utf8");
		}
	}
}

async function cleanupCodeAppsScaffold(projectDir: string): Promise<void> {
	const pathsToRemove = [
		"token.json",
		"src/services/AuthService.ts",
		"src/services/authService.ts",
		"src/context/AuthContext.tsx",
	];

	for (const relPath of pathsToRemove) {
		await fs.remove(path.join(projectDir, relPath));
	}

	await removeDirIfEmpty(path.join(projectDir, "src", "services"));
	await removeDirIfEmpty(path.join(projectDir, "src", "context"));
}

async function removeDirIfEmpty(dirPath: string): Promise<void> {
	if (!(await fs.pathExists(dirPath))) {
		return;
	}

	const entries = await fs.readdir(dirPath);
	if (entries.length === 0) {
		await fs.remove(dirPath);
	}
}

function withEcPortalContainers(source: string, filePath: string): string {
	const withPortalContainers = source.replace(
		/<([A-Za-z][A-Za-z0-9]*Primitive)\.Portal\b(?![^>]*\bcontainer=)/g,
		"<$1.Portal container={portalContainer ?? undefined}",
	);

	if (withPortalContainers === source) {
		return source;
	}

	return addEcPortalImport(
		addEcPortalHookDeclarations(withPortalContainers, filePath),
	);
}

function withGeneratedShadcnCompatibility(source: string): string {
	const withChartAttributeSelectors = removeStandaloneEcPrefixes(source)
		.replace(/\[stroke=#ccc\]/g, "[stroke='#ccc']")
		.replace(/\[stroke=#fff\]/g, "[stroke='#fff']")
		.replace(
			/"cn-input-otp flex items-center has-disabled:opacity-50"/g,
			'"cn-input-otp ec:flex ec:items-center ec:has-disabled:opacity-50"',
		)
		.replace(/String\.raw`rtl:/g, "String.raw`ec:rtl:");

	if (!withChartAttributeSelectors.includes('from "react-day-picker"')) {
		return withChartAttributeSelectors;
	}

	return withChartAttributeSelectors.replace(/(\n\s*)table:/g, "$1month_grid:");
}

function removeStandaloneEcPrefixes(source: string): string {
	let updated = source;
	let previous: string;

	do {
		previous = updated;
		updated = updated.replace(/(^|[\s"'])ec:(?=\s|["'])/g, "$1");
	} while (updated !== previous);

	return updated;
}

function addEcPortalImport(source: string): string {
	if (source.includes('from "@/runtime/EcAppShell"')) {
		return source;
	}

	const importPattern =
		/import[\s\S]*?from\s+["'][^"']+["'];?\n|import\s+["'][^"']+["'];?\n/g;
	let insertAt = 0;
	for (const match of source.matchAll(importPattern)) {
		insertAt = (match.index ?? 0) + match[0].length;
	}

	const importLine =
		'import { useEcPortalContainer } from "@/runtime/EcAppShell"\n';

	return `${source.slice(0, insertAt)}${importLine}${source.slice(insertAt)}`;
}

function addEcPortalHookDeclarations(source: string, filePath: string): string {
	const lines = source.split("\n");
	const hookBodyLines = new Set<number>();

	for (let index = 0; index < lines.length; index += 1) {
		if (!lines[index]?.includes("container={portalContainer ?? undefined}")) {
			continue;
		}

		const bodyLine = findContainingFunctionBodyLine(lines, index);
		if (bodyLine === undefined) {
			throw new Error(
				`Could not locate a function body for a shadcn Portal in ${filePath}.`,
			);
		}

		hookBodyLines.add(bodyLine);
	}

	for (const bodyLine of [...hookBodyLines].sort((a, b) => b - a)) {
		if (lines[bodyLine + 1]?.includes("const portalContainer")) {
			continue;
		}

		const indent = lines[bodyLine]?.match(/^(\s*)/)?.[1] ?? "";
		lines.splice(
			bodyLine + 1,
			0,
			`${indent}  const portalContainer = useEcPortalContainer()`,
		);
	}

	return lines.join("\n");
}

function findContainingFunctionBodyLine(
	lines: string[],
	portalLine: number,
): number | undefined {
	for (let index = portalLine; index >= 0; index -= 1) {
		if (!/^\s*function\s+\w+/.test(lines[index] ?? "")) {
			continue;
		}

		for (
			let bodyLine = index;
			bodyLine <= portalLine;
			bodyLine += 1
		) {
			if (/\)\s*\{\s*$/.test(lines[bodyLine] ?? "")) {
				return bodyLine;
			}
		}
	}

	return undefined;
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});

async function promptProjectName(): Promise<string> {
	const name = await text({
		message: "Project name",
		placeholder: "my-app",
		validate: validateProjectName,
	});

	if (isCancel(name)) {
		cancel("Operation cancelled.");
		process.exit(0);
	}

	return String(name).trim();
}

async function promptTarget(): Promise<AppTarget> {
	const target = await select<AppTarget>({
		message: "What are you building?",
		options: [
			{ label: "Web Resource", value: "webresource" },
			{ label: "Portal (WIP)", value: "portal" },
			{ label: "Static Web App", value: "swa" },
			{ label: "Power Pages", value: "power-pages" },
			{ label: "Power Apps Code App", value: "code-apps" },
		],
	});

	if (isCancel(target)) {
		cancel("Operation cancelled.");
		process.exit(0);
	}

	return target;
}

async function promptUiType(): Promise<UiTarget> {
	const uiType = await select<UiTarget>({
		message: "What UI library do you want to use?",
		options: [
			{ label: "Kendo UI", value: "kendo" },
			{ label: "Shadcn/UI", value: "shadcn-ui" },
		],
	});

	if (isCancel(uiType)) {
		cancel("Operation cancelled.");
		process.exit(0);
	}

	return uiType;
}

async function promptInstallDependencies(): Promise<boolean> {
	const shouldRunNpmInstall = await select<{ run: boolean }>({
		message: "Do you want to install dependencies?",
		options: [
			{ label: "Yes", value: { run: true } },
			{ label: "No", value: { run: false } },
		],
	});

	if (isCancel(shouldRunNpmInstall)) {
		cancel("Operation cancelled.");
		process.exit(0);
	}

	return shouldRunNpmInstall.run;
}

function validateProjectName(value: string): string | undefined {
	if (value.length === 0) return "Project name cannot be empty";
	if (value.toLocaleLowerCase() !== value)
		return "Project name must be lowercase";
	if (/\s/.test(value)) return "Project name cannot contain spaces";
	if (/[^a-z0-9-_]/.test(value))
		return "Project name can only contain letters, numbers, hyphens, and underscores";
	return undefined;
}

function parseCliArgs(argv: string[]): CliArgs {
	const read = (name: string) => {
		const equalsPrefix = `${name}=`;
		const equalsValue = argv.find((arg) => arg.startsWith(equalsPrefix));
		if (equalsValue) {
			return equalsValue.slice(equalsPrefix.length);
		}

		const index = argv.indexOf(name);
		const value = index >= 0 ? argv[index + 1] : undefined;
		return value && !value.startsWith("--") ? value : undefined;
	};

	const readAll = (name: string) => {
		const values: string[] = [];
		const equalsPrefix = `${name}=`;
		for (let index = 0; index < argv.length; index += 1) {
			const arg = argv[index];
			if (arg?.startsWith(equalsPrefix)) {
				values.push(arg.slice(equalsPrefix.length));
			}

			if (
				arg === name &&
				argv[index + 1] &&
				!argv[index + 1]?.startsWith("--")
			) {
				values.push(argv[index + 1] as string);
			}
		}
		return values;
	};

	const has = (name: string) => argv.includes(name);
	const target = readTarget(argv);
	const uiType = readUiType(argv);
	const layers = readAll("--layer");
	if (has("--install") && has("--no-install")) {
		throw new Error("Use only one dependency option: --install or --no-install.");
	}
	const install = has("--install") ? true : has("--no-install") ? false : undefined;

	return {
		...defined("pcfDir", read("--pcf-dir")),
		...defined("controlConstructor", read("--constructor")),
		...defined("description", read("--description")),
		...defined("displayName", read("--display-name")),
		...defined("dist", read("--dist")),
		...(layers.length > 0 ? { layers } : {}),
		...defined("namespace", read("--namespace")),
		...defined("output", read("--output")),
		...defined("packageName", read("--package-name")),
		...defined("template", read("--template")),
		...defined("version", read("--version")),
		...defined("projectName", read("--project-name") ?? read("--name")),
		...defined("target", target),
		...defined("uiType", uiType),
		...defined("install", install),
	};
}

function defined<K extends keyof CliArgs>(
	key: K,
	value: CliArgs[K] | undefined,
): Pick<CliArgs, K> | Record<string, never> {
	return value === undefined ? {} : ({ [key]: value } as Pick<CliArgs, K>);
}

function readTarget(argv: string[]): AppTarget | undefined {
	const targetFlags: Array<[string, AppTarget]> = [
		["--webresource", "webresource"],
		["--portal", "portal"],
		["--power-pages", "power-pages"],
		["--swa", "swa"],
		["--code-apps", "code-apps"],
		["--code-app", "code-apps"],
	];
	const selected = targetFlags.filter(([flag]) => argv.includes(flag));
	const targetValue = readStringOption(argv, "--target");

	if (selected.length > 1 || (selected.length === 1 && targetValue)) {
		throw new Error(
			"Use only one target option: --webresource, --portal, --power-pages, --swa, --code-apps, --code-app, or --target.",
		);
	}

	if (selected.length === 1) {
		return selected[0]?.[1];
	}

	if (!targetValue) {
		return undefined;
	}

	if (isAppTarget(targetValue)) {
		return targetValue;
	}

	throw new Error(
		`Unsupported target "${targetValue}". Use webresource, portal, power-pages, swa, or code-apps.`,
	);
}

function readUiType(argv: string[]): UiTarget | undefined {
	const uiFlags: Array<[string, UiTarget]> = [
		["--kendo", "kendo"],
		["--shadcn", "shadcn-ui"],
		["--shadcn-ui", "shadcn-ui"],
	];
	const selected = uiFlags.filter(([flag]) => argv.includes(flag));
	const uiValue = readStringOption(argv, "--ui");

	if (selected.length > 1 || (selected.length === 1 && uiValue)) {
		throw new Error(
			"Use only one UI option: --kendo, --shadcn, --shadcn-ui, or --ui.",
		);
	}

	if (selected.length === 1) {
		return selected[0]?.[1];
	}

	if (!uiValue) {
		return undefined;
	}

	if (isUiTarget(uiValue)) {
		return uiValue;
	}

	if (uiValue === "shadcn") {
		return "shadcn-ui";
	}

	throw new Error(`Unsupported UI "${uiValue}". Use kendo, shadcn, or shadcn-ui.`);
}

function readStringOption(argv: string[], name: string): string | undefined {
	const equalsPrefix = `${name}=`;
	const equalsValue = argv.find((arg) => arg.startsWith(equalsPrefix));
	if (equalsValue) {
		return equalsValue.slice(equalsPrefix.length);
	}

	const index = argv.indexOf(name);
	const value = index >= 0 ? argv[index + 1] : undefined;
	return value && !value.startsWith("--") ? value : undefined;
}

function isAppTarget(value: string): value is AppTarget {
	return ["webresource", "portal", "power-pages", "swa", "code-apps"].includes(value);
}

function isUiTarget(value: string): value is UiTarget {
	return ["kendo", "shadcn-ui"].includes(value);
}

function stripUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
	const entries = Object.entries(value).filter(([, entryValue]) => entryValue !== undefined);
	return Object.fromEntries(entries) as Partial<T>;
}

// NOTE: Constants
const POWER_PAGES_KENDO_MAIN_TSX = `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@progress/kendo-theme-fluent/dist/all.css";
import "./index.css";
import App from "./App.tsx";
import { EcAppShell } from "./runtime/EcAppShell.tsx";

import { AuthProvider } from "./context/AuthContext.tsx";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 3,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
        mutations: {
            retry: 1,
        },
    },
});

const root = createRoot(document.getElementById("root")!);

root.render(
    <StrictMode>
        <AuthProvider>
            <QueryClientProvider client={queryClient}>
                <EcAppShell>
                    <App />
                </EcAppShell>
            </QueryClientProvider>
        </AuthProvider>
    </StrictMode>
);`;

const GIT_IGNORE = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Build outputs
dist/
build/

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# node-waf configuration
.lock-wscript

# Compiled binary addons
build/Release

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# parcel-bundler cache
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db`;
