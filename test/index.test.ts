import os from "node:os";
import path from "node:path";
import fs from "fs-extra";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	assertCanCreateProjectDir,
	initializeGit,
	isAppTarget,
	isUiTarget,
	parseCliArgs,
	printHelp,
	readStringOption,
	readTarget,
	readUiType,
	resolveScaffoldOptions,
	scaffoldProject,
	stripUndefined,
	validateProjectName,
} from "../src/index";

const tempDirs: string[] = [];
const originalCwd = process.cwd();

afterEach(async () => {
	process.chdir(originalCwd);
	await Promise.all(tempDirs.splice(0).map((dir) => fs.remove(dir)));
	vi.restoreAllMocks();
});

async function makeTempDir(): Promise<string> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), "create-ec-app-cli-"));
	tempDirs.push(dir);
	return dir;
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
				"--install",
				"--force",
				"--skip-git",
			]),
		).toEqual({
			projectName: "demo",
			target: "webresource",
			uiType: "shadcn-ui",
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
		expect(log.mock.calls[0]?.[0]).toContain("--skip-git");
		expect(log.mock.calls[0]?.[0]).toContain("--force");
		expect(log.mock.calls[0]?.[0]).toContain("--pcf-dir");
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

	it("reports git initialization failures with the skip-git escape hatch", async () => {
		const rootDir = await makeTempDir();

		expect(() => initializeGit(path.join(rootDir, "missing"))).toThrow(
			"rerun with --skip-git",
		);
	});
});
