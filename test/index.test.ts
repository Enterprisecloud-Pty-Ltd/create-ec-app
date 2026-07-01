import os from "node:os";
import path from "node:path";
import fs from "fs-extra";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	assertCanCreateProjectDir,
	cleanupCodeAppsScaffold,
	initializeGit,
	isAppTarget,
	isMainModule,
	isUiTarget,
	main,
	parseCliArgs,
	printHelp,
	readStringOption,
	readTarget,
	readUiType,
	resolveScaffoldOptions,
	runCliEntrypoint,
	scaffoldProject,
	stripUndefined,
	validateProjectName,
	validateShadcnRegistryUrl,
} from "../src/index";
import type { AppTarget, UiTarget } from "../src/index";

const tempDirs: string[] = [];
const originalCwd = process.cwd();
const originalArgv = process.argv;
const originalGitEnv = {
	authorEmail: process.env.GIT_AUTHOR_EMAIL,
	authorName: process.env.GIT_AUTHOR_NAME,
	committerEmail: process.env.GIT_COMMITTER_EMAIL,
	committerName: process.env.GIT_COMMITTER_NAME,
};

afterEach(async () => {
	process.chdir(originalCwd);
	process.argv = originalArgv;
	restoreGitEnv();
	await Promise.all(tempDirs.splice(0).map((dir) => fs.remove(dir)));
	vi.restoreAllMocks();
});

async function makeTempDir(): Promise<string> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), "create-ec-app-cli-"));
	tempDirs.push(dir);
	return dir;
}

function setGitIdentityEnv(): void {
	process.env.GIT_AUTHOR_EMAIL = "test@example.com";
	process.env.GIT_AUTHOR_NAME = "create-ec-app tests";
	process.env.GIT_COMMITTER_EMAIL = "test@example.com";
	process.env.GIT_COMMITTER_NAME = "create-ec-app tests";
}

function restoreGitEnv(): void {
	setOptionalEnv("GIT_AUTHOR_EMAIL", originalGitEnv.authorEmail);
	setOptionalEnv("GIT_AUTHOR_NAME", originalGitEnv.authorName);
	setOptionalEnv("GIT_COMMITTER_EMAIL", originalGitEnv.committerEmail);
	setOptionalEnv("GIT_COMMITTER_NAME", originalGitEnv.committerName);
}

function setOptionalEnv(name: string, value: string | undefined): void {
	if (value === undefined) {
		delete process.env[name];
		return;
	}

	process.env[name] = value;
}

describe("parseCliArgs", () => {
	it("parses scaffold, install, force, and skip-git options", () => {
		expect(
			parseCliArgs([
				"--name",
				"demo",
				"--target=webresource",
				"--ui",
				"shadcn",
				"--shadcn-registry",
				"https://example.com/r/registry.json",
				"--install",
				"--force",
				"--skip-git",
			]),
		).toEqual({
			projectName: "demo",
			target: "webresource",
			uiType: "shadcn-ui",
			shadcnRegistry: "https://example.com/r/registry.json",
			install: true,
			force: true,
			skipGit: true,
		});
	});

	it("parses PCF options and repeated layers", () => {
		expect(
			parseCliArgs([
				"--pcf-dir",
				".",
				"--output=pcf/Demo",
				"--namespace",
				"EC",
				"--constructor",
				"DemoHost",
				"--display-name",
				"Demo Host",
				"--description",
				"Wrapped app",
				"--version",
				"1.2.3",
				"--template",
				"templates/pcf/base",
				"--dist",
				"build",
				"--package-name",
				"demo-host",
				"--layer",
				"layer-one",
				"--layer=layer-two",
			]),
		).toEqual({
			pcfDir: ".",
			output: "pcf/Demo",
			namespace: "EC",
			controlConstructor: "DemoHost",
			displayName: "Demo Host",
			description: "Wrapped app",
			version: "1.2.3",
			template: "templates/pcf/base",
			dist: "build",
			packageName: "demo-host",
			layers: ["layer-one", "layer-two"],
		});
	});

	it("rejects conflicting and unsupported options", () => {
		expect(() => parseCliArgs(["--install", "--no-install"])).toThrow(
			"Use only one dependency option",
		);
		expect(() => readTarget(["--target", "swa", "--webresource"])).toThrow(
			"Use only one target option",
		);
		expect(() => readTarget(["--target", "unknown"])).toThrow(
			'Unsupported target "unknown"',
		);
		expect(() => readUiType(["--ui", "kendo", "--shadcn"])).toThrow(
			"Use only one UI option",
		);
		expect(() => readUiType(["--ui", "unknown"])).toThrow(
			'Unsupported UI "unknown"',
		);
	});

	it("supports target and UI shorthand flags", () => {
		expect(readTarget(["--portal"])).toBe("portal");
		expect(readTarget(["--power-pages"])).toBe("power-pages");
		expect(readTarget(["--swa"])).toBe("swa");
		expect(readTarget(["--code-app"])).toBe("code-apps");
		expect(readTarget([])).toBeUndefined();
		expect(readUiType(["--kendo"])).toBe("kendo");
		expect(readUiType(["--shadcn-ui"])).toBe("shadcn-ui");
		expect(readUiType([])).toBeUndefined();
	});
});

describe("CLI helper functions", () => {
	it("validates supported names, targets, and UI values", () => {
		expect(validateProjectName(undefined)).toBe("Project name cannot be empty");
		expect(validateProjectName("")).toBe("Project name cannot be empty");
		expect(validateProjectName("Bad")).toBe("Project name must be lowercase");
		expect(validateProjectName("bad name")).toBe(
			"Project name cannot contain spaces",
		);
		expect(validateProjectName("bad!")).toBe(
			"Project name can only contain letters, numbers, hyphens, and underscores",
		);
		expect(validateProjectName("good-name_1")).toBeUndefined();
		expect(isAppTarget("portal")).toBe(true);
		expect(isAppTarget("bad")).toBe(false);
		expect(isUiTarget("shadcn-ui")).toBe(true);
		expect(isUiTarget("bad")).toBe(false);
		expect(validateShadcnRegistryUrl(undefined)).toBe(
			"shadcn registry.json URL cannot be empty",
		);
		expect(validateShadcnRegistryUrl("")).toBe(
			"shadcn registry.json URL cannot be empty",
		);
		expect(validateShadcnRegistryUrl("not a url")).toContain(
			"Invalid shadcn registry URL",
		);
		expect(validateShadcnRegistryUrl("file:///tmp/registry.json")).toContain(
			"Unsupported shadcn registry URL",
		);
		expect(
			validateShadcnRegistryUrl(" https://example.com/r/registry.json "),
		).toBeUndefined();
		expect(validateShadcnRegistryUrl("https://example.com")).toContain(
			"Use a registry.json URL",
		);
	});

	it("reads options and strips undefined values", () => {
		expect(readStringOption(["--name=demo"], "--name")).toBe("demo");
		expect(readStringOption(["--name", "demo"], "--name")).toBe("demo");
		expect(readStringOption(["--name", "--target"], "--name")).toBeUndefined();
		expect(stripUndefined({ keep: "yes", skip: undefined })).toEqual({
			keep: "yes",
		});
	});

	it("prints help text without prompting", () => {
		const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

		printHelp();

		expect(log).toHaveBeenCalledOnce();
		expect(log.mock.calls[0]?.[0]).toContain("Agent-friendly usage");
		expect(log.mock.calls[0]?.[0]).toContain("Provide --project-name, --target, and --ui");
		expect(log.mock.calls[0]?.[0]).toContain("Interactive usage");
		expect(log.mock.calls[0]?.[0]).toContain("Shadcn/UI from custom registry");
		expect(log.mock.calls[0]?.[0]).toContain(
			"--ui shadcn-ui --shadcn-registry <registry.json URL>",
		);
		expect(log.mock.calls[0]?.[0]).toContain("--no-install --skip-git");
		expect(log.mock.calls[0]?.[0]).toContain("--skip-git");
		expect(log.mock.calls[0]?.[0]).toContain("--force");
		expect(log.mock.calls[0]?.[0]).toContain("--pcf-dir");
		expect(log.mock.calls[0]?.[0]).toContain("--package-name");
		expect(log.mock.calls[0]?.[0]).toContain("--shadcn-registry");
	});

	it("resolves non-interactive scaffold options", async () => {
		await expect(
			resolveScaffoldOptions({
				projectName: "demo",
				target: "swa",
				uiType: "kendo",
				install: true,
				force: true,
				skipGit: true,
			}),
		).resolves.toEqual({
			projectName: "demo",
			target: "swa",
			uiType: "kendo",
			install: true,
			force: true,
			skipGit: true,
		});
	});

	it("defaults dependency installation off when all scaffold options are provided", async () => {
		await expect(
			resolveScaffoldOptions({
				projectName: "demo",
				target: "swa",
				uiType: "kendo",
			}),
		).resolves.toEqual({
			projectName: "demo",
			target: "swa",
			uiType: "kendo",
			install: false,
			force: false,
			skipGit: false,
		});
	});

	it("resolves custom shadcn registry options", async () => {
		await expect(
			resolveScaffoldOptions({
				projectName: "demo",
				target: "swa",
				uiType: "shadcn-ui",
				shadcnRegistry: "https://example.com/r/registry.json",
			}),
		).resolves.toEqual({
			projectName: "demo",
			target: "swa",
			uiType: "shadcn-ui",
			shadcnRegistry: "https://example.com/r/registry.json",
			install: false,
			force: false,
			skipGit: false,
		});
	});

	it("rejects custom shadcn registries for other UI layers", async () => {
		await expect(
			resolveScaffoldOptions({
				projectName: "demo",
				target: "swa",
				uiType: "kendo",
				shadcnRegistry: "https://example.com/r/registry.json",
			}),
		).rejects.toThrow("--shadcn-registry can only be used with --ui shadcn-ui");
	});

	it("rejects invalid project names while resolving options", async () => {
		await expect(
			resolveScaffoldOptions({
				projectName: "Bad",
				target: "swa",
				uiType: "kendo",
			}),
		).rejects.toThrow("Project name must be lowercase");
	});

	it("detects direct CLI entrypoint execution", () => {
		const moduleFile = path.join(originalCwd, "src", "index.ts");

		expect(isMainModule("", moduleFile)).toBe(false);
		expect(isMainModule(path.join(originalCwd, "test", "index.test.ts"), moduleFile)).toBe(
			false,
		);
		expect(isMainModule(moduleFile, moduleFile)).toBe(true);
	});

	it("runs entrypoint handlers only for direct CLI execution", async () => {
		const runMain = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);

		runCliEntrypoint(false, runMain);
		expect(runMain).not.toHaveBeenCalled();

		runCliEntrypoint(true, runMain);
		await Promise.resolve();
		expect(runMain).toHaveBeenCalledOnce();
	});

	it("reports entrypoint failures and exits non-zero", async () => {
		const error = new Error("entrypoint failed");
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
		const exit = vi
			.spyOn(process, "exit")
			.mockImplementation((() => undefined) as never);

		runCliEntrypoint(true, () => Promise.reject(error));

		await vi.waitFor(() => {
			expect(consoleError).toHaveBeenCalledWith(error);
			expect(exit).toHaveBeenCalledWith(1);
		});
	});
});

describe("project directory safety", () => {
	it("allows missing and empty output directories", async () => {
		const rootDir = await makeTempDir();
		const missingDir = path.join(rootDir, "missing");
		const emptyDir = path.join(rootDir, "empty");
		await fs.ensureDir(emptyDir);

		await expect(assertCanCreateProjectDir(missingDir, false)).resolves.toBeUndefined();
		await expect(assertCanCreateProjectDir(emptyDir, false)).resolves.toBeUndefined();
	});

	it("fails for non-empty directories unless force is enabled", async () => {
		const rootDir = await makeTempDir();
		const projectDir = path.join(rootDir, "demo");
		await fs.outputFile(path.join(projectDir, "file.txt"), "existing");

		await expect(assertCanCreateProjectDir(projectDir, false)).rejects.toThrow(
			"already exists and is not empty",
		);

		await assertCanCreateProjectDir(projectDir, true);

		await expect(fs.pathExists(projectDir)).resolves.toBe(false);
	});
});

describe("scaffoldProject", () => {
	it("creates a shadcn Code Apps project without install or git", async () => {
		const rootDir = await makeTempDir();
		process.chdir(rootDir);

		await scaffoldProject({
			projectName: "code-app-demo",
			target: "code-apps",
			uiType: "shadcn-ui",
			install: false,
			force: false,
			skipGit: true,
		});

		const projectDir = path.join(rootDir, "code-app-demo");
		await expect(
			fs.pathExists(path.join(projectDir, "src", "components", "ui", "button.tsx")),
		).resolves.toBe(true);
		await expect(
			fs.pathExists(path.join(projectDir, "src", "lib", "utils.ts")),
		).resolves.toBe(true);
		await expect(
			fs.pathExists(path.join(projectDir, "power.config.example.json")),
		).resolves.toBe(true);
		await expect(fs.pathExists(path.join(projectDir, ".git"))).resolves.toBe(false);
		await expect(fs.pathExists(path.join(projectDir, "token.json"))).resolves.toBe(false);
		await expect(
			fs.pathExists(path.join(projectDir, "src", "services", "AuthService.ts")),
		).resolves.toBe(false);
	});

	it("applies the Power Pages Kendo main template", async () => {
		const rootDir = await makeTempDir();
		process.chdir(rootDir);

		await scaffoldProject({
			projectName: "power-pages-kendo",
			target: "power-pages",
			uiType: "kendo",
			install: false,
			force: false,
			skipGit: true,
		});

		await expect(
			fs.readFile(path.join(rootDir, "power-pages-kendo", "src", "main.tsx"), "utf8"),
		).resolves.toContain("<AuthProvider>");
	});

	it("can scaffold from the base template when target and UI layers are absent", async () => {
		const rootDir = await makeTempDir();
		process.chdir(rootDir);

		await scaffoldProject({
			projectName: "base-only",
			target: "missing-target" as AppTarget,
			uiType: "missing-ui" as UiTarget,
			install: false,
			force: false,
			skipGit: true,
		});

		const projectDir = path.join(rootDir, "base-only");
		await expect(fs.pathExists(path.join(projectDir, "src", "App.tsx"))).resolves.toBe(
			true,
		);
		await expect(
			fs.pathExists(path.join(projectDir, "staticwebapp.config.json")),
		).resolves.toBe(false);
		await expect(fs.pathExists(path.join(projectDir, "components.json"))).resolves.toBe(
			false,
		);
	});

	it("can initialize git when git is not skipped", async () => {
		const rootDir = await makeTempDir();
		process.chdir(rootDir);
		setGitIdentityEnv();

		await scaffoldProject({
			projectName: "git-demo",
			target: "swa",
			uiType: "kendo",
			install: false,
			force: false,
			skipGit: false,
		});

		await expect(
			fs.pathExists(path.join(rootDir, "git-demo", ".git")),
		).resolves.toBe(true);
	});

	it("reports git initialization failures with the skip-git escape hatch", async () => {
		const rootDir = await makeTempDir();

		expect(() => initializeGit(path.join(rootDir, "missing"))).toThrow(
			"rerun with --skip-git",
		);
	});

	it("leaves Code Apps service and context folders when unrelated files remain", async () => {
		const projectDir = await makeTempDir();
		await fs.outputFile(path.join(projectDir, "token.json"), "{}");
		await fs.outputFile(
			path.join(projectDir, "src", "services", "AuthService.ts"),
			"export {}",
		);
		await fs.outputFile(
			path.join(projectDir, "src", "services", "keep.ts"),
			"export {}",
		);
		await fs.outputFile(
			path.join(projectDir, "src", "context", "AuthContext.tsx"),
			"export {}",
		);
		await fs.outputFile(
			path.join(projectDir, "src", "context", "keep.tsx"),
			"export {}",
		);

		await cleanupCodeAppsScaffold(projectDir);

		await expect(fs.pathExists(path.join(projectDir, "token.json"))).resolves.toBe(
			false,
		);
		await expect(
			fs.pathExists(path.join(projectDir, "src", "services", "AuthService.ts")),
		).resolves.toBe(false);
		await expect(
			fs.pathExists(path.join(projectDir, "src", "services", "keep.ts")),
		).resolves.toBe(true);
		await expect(
			fs.pathExists(path.join(projectDir, "src", "context", "AuthContext.tsx")),
		).resolves.toBe(false);
		await expect(
			fs.pathExists(path.join(projectDir, "src", "context", "keep.tsx")),
		).resolves.toBe(true);
	});

	it("removes empty Code Apps service and context folders", async () => {
		const projectDir = await makeTempDir();
		await fs.outputFile(
			path.join(projectDir, "src", "services", "AuthService.ts"),
			"export {}",
		);
		await fs.outputFile(
			path.join(projectDir, "src", "context", "AuthContext.tsx"),
			"export {}",
		);

		await cleanupCodeAppsScaffold(projectDir);

		await expect(fs.pathExists(path.join(projectDir, "src", "services"))).resolves.toBe(
			false,
		);
		await expect(fs.pathExists(path.join(projectDir, "src", "context"))).resolves.toBe(
			false,
		);
	});
});

describe("main", () => {
	it("prints help and exits without prompting", async () => {
		process.argv = ["node", "create-ec-app", "--help"];
		const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
		const exit = vi.spyOn(process, "exit").mockImplementation((() => {
			throw new Error("process exit");
		}) as never);

		await expect(main()).rejects.toThrow("process exit");

		expect(log).toHaveBeenCalledWith(expect.stringContaining("--help, -h"));
		expect(exit).toHaveBeenCalledWith(0);
	});

	it("runs the non-interactive scaffold path", async () => {
		const rootDir = await makeTempDir();
		process.chdir(rootDir);
		process.argv = [
			"node",
			"create-ec-app",
			"--project-name",
			"main-demo",
			"--target",
			"swa",
			"--ui",
			"kendo",
			"--no-install",
			"--skip-git",
		];

		await main();

		await expect(
			fs.pathExists(path.join(rootDir, "main-demo", "staticwebapp.config.json")),
		).resolves.toBe(true);
		await expect(
			fs.pathExists(path.join(rootDir, "main-demo", ".git")),
		).resolves.toBe(false);
	});

	it("runs the PCF generation path", async () => {
		const projectDir = await makeTempDir();
		await fs.outputJson(path.join(projectDir, "package.json"), {
			name: "main-pcf",
		});
		await fs.outputFile(
			path.join(projectDir, "src", "App.tsx"),
			"export default function App() { return null }",
		);
		await fs.outputFile(
			path.join(projectDir, "dist", "main.css"),
			".button { color: blue; }",
		);
		process.argv = [
			"node",
			"create-ec-app",
			"--pcf-dir",
			projectDir,
			"--output",
			"pcf/MainHost",
			"--constructor",
			"MainHost",
		];

		await main();

		await expect(
			fs.pathExists(path.join(projectDir, "pcf", "MainHost", "MainHost.pcfproj")),
		).resolves.toBe(true);
	});
});
