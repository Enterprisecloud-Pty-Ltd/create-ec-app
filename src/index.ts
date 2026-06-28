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

export type AppTarget =
	| "webresource"
	| "portal"
	| "power-pages"
	| "swa"
	| "code-apps";
export type UiTarget = "kendo" | "shadcn-ui";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface CliArgs {
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
	force?: boolean;
	skipGit?: boolean;
}

export async function main() {
	const argv = process.argv.slice(2);

	if (argv.includes("--help") || argv.includes("-h")) {
		printHelp();
		process.exit(0);
	}

	const cliArgs = parseCliArgs(argv);

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

export async function resolveScaffoldOptions(
	cliArgs: CliArgs,
): Promise<ScaffoldOptions> {
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
		force: cliArgs.force ?? false,
		skipGit: cliArgs.skipGit ?? false,
	};
}

export interface ScaffoldOptions {
	install: boolean;
	force: boolean;
	projectName: string;
	skipGit: boolean;
	target: AppTarget;
	uiType: UiTarget;
}

export async function scaffoldProject({
	install,
	force,
	projectName,
	skipGit,
	target,
	uiType,
}: ScaffoldOptions) {
	const projectDir = path.join(process.cwd(), projectName);
	const templatesRoot = path.join(__dirname, "..", "templates");

	const baseDir = path.join(templatesRoot, "base");
	const targetDir = path.join(templatesRoot, "targets", target);
	const uiDir = path.join(templatesRoot, "ui", uiType);

	await assertCanCreateProjectDir(projectDir, force);
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

	//WARN: This is a special case fix for having AuthContext in Kendo for Power Pages
	if (target === "power-pages" && uiType === "kendo") {
		const mainTsxPath = path.join(projectDir, "src", "main.tsx");
		await fs.writeFile(mainTsxPath, POWER_PAGES_KENDO_MAIN_TSX, "utf-8");
	}

	if (install) {
		const s = spinner();
		s.start("Running npm install...");
		execSync("npm install", { cwd: projectDir, stdio: "inherit" });
		s.stop("Dependencies installed.");
	}

	//INFO: npx on Windows can cause issues, so checking and creating a new gitignore
	const gitignorePath = path.join(projectDir, ".gitignore");
	if (!fs.existsSync(gitignorePath)) {
		await fs.writeFile(gitignorePath, GIT_IGNORE, "utf-8");
	}

	if (!skipGit) {
		const sGit = spinner();
		sGit.start("Initializing git repository...");
		try {
			initializeGit(projectDir);
		} catch (error) {
			sGit.stop("Git initialization failed.");
			throw error;
		}
		sGit.stop("Git repository initialized.");
	}
}

export async function assertCanCreateProjectDir(
	projectDir: string,
	force: boolean,
): Promise<void> {
	if (!(await fs.pathExists(projectDir))) {
		return;
	}

	const entries = await fs.readdir(projectDir);

	if (entries.length === 0) {
		return;
	}

	if (!force) {
		throw new Error(
			`Directory "${projectDir}" already exists and is not empty. Use --force to overwrite it.`,
		);
	}

	log.warn(`Overwriting existing directory: ${projectDir}`);
	await fs.remove(projectDir);
}

export function initializeGit(projectDir: string): void {
	try {
		execSync("git init", { cwd: projectDir, stdio: "ignore" });
		execSync("git add .", { cwd: projectDir, stdio: "ignore" });
		execSync('git commit -m "Initial commit"', {
			cwd: projectDir,
			stdio: "ignore",
		});
	} catch (error) {
		throw new Error(
			"Git initialization failed. Ensure Git is installed and user.name/user.email are configured, or rerun with --skip-git.",
			{ cause: error },
		);
	}
}

export async function cleanupCodeAppsScaffold(projectDir: string): Promise<void> {
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

if (isMainModule()) {
	main().catch((err) => {
		console.error(err);
		process.exit(1);
	});
}

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

export function printHelp(): void {
	console.log(`create-ec-app

Usage:
  create-ec-app --project-name my-app --target webresource --ui shadcn-ui
  create-ec-app --project-name my-code-app --target code-apps --ui kendo --skip-git
  create-ec-app --pcf-dir . --output ./pcf/MyControl --namespace EC --constructor MyControl

Scaffold options:
  --project-name, --name <name>    Project folder and package name
  --target <target>                webresource, portal, power-pages, swa, or code-apps
  --webresource                    Shortcut for --target webresource
  --portal                         Shortcut for --target portal
  --power-pages                    Shortcut for --target power-pages
  --swa                            Shortcut for --target swa
  --code-apps, --code-app          Shortcut for --target code-apps
  --ui <ui>                        kendo or shadcn-ui
  --kendo                          Shortcut for --ui kendo
  --shadcn, --shadcn-ui            Shortcut for --ui shadcn-ui
  --install                        Run npm install after scaffolding
  --no-install                     Skip npm install
  --force                          Overwrite an existing non-empty project directory
  --skip-git                       Skip git init, add, and initial commit

PCF wrapper options:
  --pcf-dir <dir>                  Existing webresource app directory
  --output <dir>                   PCF output directory
  --namespace <name>               PCF namespace
  --constructor <name>             PCF control constructor name
  --display-name <name>            PCF display name
  --description <text>             PCF description
  --version <version>              PCF version
  --template <dir>                 PCF template directory
  --layer <dir>                    Extra PCF template layer; repeatable
  --dist <dir>                     Built webresource output directory

General:
  --help, -h                       Show this help
`);
}

export function validateProjectName(value: string | undefined): string | undefined {
	if (value === undefined) return "Project name cannot be empty";
	if (value.length === 0) return "Project name cannot be empty";
	if (value.toLocaleLowerCase() !== value)
		return "Project name must be lowercase";
	if (/\s/.test(value)) return "Project name cannot contain spaces";
	if (/[^a-z0-9-_]/.test(value))
		return "Project name can only contain letters, numbers, hyphens, and underscores";
	return undefined;
}

export function parseCliArgs(argv: string[]): CliArgs {
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
		...defined("force", has("--force") ? true : undefined),
		...defined("skipGit", has("--skip-git") ? true : undefined),
	};
}

function defined<K extends keyof CliArgs>(
	key: K,
	value: CliArgs[K] | undefined,
): Pick<CliArgs, K> | Record<string, never> {
	return value === undefined ? {} : ({ [key]: value } as Pick<CliArgs, K>);
}

export function readTarget(argv: string[]): AppTarget | undefined {
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

export function readUiType(argv: string[]): UiTarget | undefined {
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

export function readStringOption(
	argv: string[],
	name: string,
): string | undefined {
	const equalsPrefix = `${name}=`;
	const equalsValue = argv.find((arg) => arg.startsWith(equalsPrefix));
	if (equalsValue) {
		return equalsValue.slice(equalsPrefix.length);
	}

	const index = argv.indexOf(name);
	const value = index >= 0 ? argv[index + 1] : undefined;
	return value && !value.startsWith("--") ? value : undefined;
}

export function isAppTarget(value: string): value is AppTarget {
	return ["webresource", "portal", "power-pages", "swa", "code-apps"].includes(value);
}

export function isUiTarget(value: string): value is UiTarget {
	return ["kendo", "shadcn-ui"].includes(value);
}

export function stripUndefined<T extends Record<string, unknown>>(
	value: T,
): Partial<T> {
	const entries = Object.entries(value).filter(([, entryValue]) => entryValue !== undefined);
	return Object.fromEntries(entries) as Partial<T>;
}

function isMainModule(): boolean {
	return process.argv[1]
		? path.resolve(process.argv[1]) === __filename
		: false;
}

// NOTE: Constants
const POWER_PAGES_KENDO_MAIN_TSX = `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@progress/kendo-theme-fluent/dist/all.css";
import "./index.css";
import App from "./App.tsx";

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
                <App />
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
