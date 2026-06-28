import os from "node:os";
import path from "node:path";
import fs from "fs-extra";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const promptMocks = vi.hoisted(() => {
	const cancelValue = { canceled: true };
	return {
		cancelValue,
		cancel: vi.fn(),
		intro: vi.fn(),
		isCancel: vi.fn((value: unknown) => value === cancelValue),
		log: {
			step: vi.fn(),
			warn: vi.fn(),
		},
		outro: vi.fn(),
		select: vi.fn(),
		spinner: vi.fn(() => ({
			start: vi.fn(),
			stop: vi.fn(),
		})),
		text: vi.fn(),
	};
});

const childProcessMocks = vi.hoisted(() => ({
	execSync: vi.fn(),
}));

vi.mock("@clack/prompts", () => promptMocks);
vi.mock("node:child_process", () => childProcessMocks);

import { resolveScaffoldOptions, scaffoldProject } from "../src/index";

const tempDirs: string[] = [];
const originalCwd = process.cwd();

beforeEach(() => {
	childProcessMocks.execSync.mockReset();
	promptMocks.cancel.mockClear();
	promptMocks.intro.mockClear();
	promptMocks.isCancel.mockClear();
	promptMocks.log.step.mockClear();
	promptMocks.log.warn.mockClear();
	promptMocks.outro.mockClear();
	promptMocks.select.mockReset();
	promptMocks.spinner.mockClear();
	promptMocks.text.mockReset();
});

afterEach(async () => {
	process.chdir(originalCwd);
	await Promise.all(tempDirs.splice(0).map((dir) => fs.remove(dir)));
	vi.restoreAllMocks();
});

async function makeTempDir(): Promise<string> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), "create-ec-app-prompts-"));
	tempDirs.push(dir);
	return dir;
}

function mockProcessExit(): void {
	vi.spyOn(process, "exit").mockImplementation((() => {
		throw new Error("process exit");
	}) as never);
}

describe("prompted scaffold options", () => {
	it("resolves project, target, UI, and install prompts", async () => {
		promptMocks.text.mockResolvedValue(" prompted-app ");
		promptMocks.select
			.mockResolvedValueOnce("portal")
			.mockResolvedValueOnce("shadcn-ui")
			.mockResolvedValueOnce({ run: true });

		await expect(resolveScaffoldOptions({})).resolves.toEqual({
			projectName: "prompted-app",
			target: "portal",
			uiType: "shadcn-ui",
			install: true,
			force: false,
			skipGit: false,
		});
		expect(promptMocks.text).toHaveBeenCalledWith(
			expect.objectContaining({ message: "Project name" }),
		);
		expect(promptMocks.select).toHaveBeenCalledTimes(3);
	});

	it("exits cleanly when the project prompt is cancelled", async () => {
		mockProcessExit();
		promptMocks.text.mockResolvedValue(promptMocks.cancelValue);

		await expect(resolveScaffoldOptions({})).rejects.toThrow("process exit");

		expect(promptMocks.cancel).toHaveBeenCalledWith("Operation cancelled.");
		expect(process.exit).toHaveBeenCalledWith(0);
	});

	it("exits cleanly when the target prompt is cancelled", async () => {
		mockProcessExit();
		promptMocks.select.mockResolvedValue(promptMocks.cancelValue);

		await expect(resolveScaffoldOptions({ projectName: "demo" })).rejects.toThrow(
			"process exit",
		);

		expect(promptMocks.cancel).toHaveBeenCalledWith("Operation cancelled.");
		expect(process.exit).toHaveBeenCalledWith(0);
	});

	it("exits cleanly when the UI prompt is cancelled", async () => {
		mockProcessExit();
		promptMocks.select.mockResolvedValue(promptMocks.cancelValue);

		await expect(
			resolveScaffoldOptions({ projectName: "demo", target: "swa" }),
		).rejects.toThrow("process exit");

		expect(promptMocks.cancel).toHaveBeenCalledWith("Operation cancelled.");
		expect(process.exit).toHaveBeenCalledWith(0);
	});

	it("exits cleanly when the install prompt is cancelled", async () => {
		mockProcessExit();
		promptMocks.select
			.mockResolvedValueOnce("kendo")
			.mockResolvedValueOnce(promptMocks.cancelValue);

		await expect(
			resolveScaffoldOptions({ projectName: "demo", target: "swa" }),
		).rejects.toThrow("process exit");

		expect(promptMocks.cancel).toHaveBeenCalledWith("Operation cancelled.");
		expect(process.exit).toHaveBeenCalledWith(0);
	});
});

describe("scaffold side effects", () => {
	it("runs dependency installation when requested", async () => {
		const rootDir = await makeTempDir();
		process.chdir(rootDir);
		const originalExistsSync = fs.existsSync;
		vi.spyOn(fs, "existsSync").mockImplementation((filePath) => {
			if (String(filePath).endsWith(".gitignore")) {
				return false;
			}

			return originalExistsSync(filePath);
		});

		await scaffoldProject({
			projectName: "install-demo",
			target: "swa",
			uiType: "kendo",
			install: true,
			force: false,
			skipGit: true,
		});

		const projectDir = await fs.realpath(path.join(rootDir, "install-demo"));
		expect(childProcessMocks.execSync).toHaveBeenCalledWith("npm install", {
			cwd: projectDir,
			stdio: "inherit",
		});
		await expect(fs.readFile(path.join(projectDir, ".gitignore"), "utf8")).resolves.toContain(
			"node_modules/",
		);
	});

	it("stops the git spinner and rethrows git initialization failures", async () => {
		const rootDir = await makeTempDir();
		process.chdir(rootDir);
		childProcessMocks.execSync.mockImplementation((command: string) => {
			if (command === "git init") {
				throw new Error("git unavailable");
			}
		});

		await expect(
			scaffoldProject({
				projectName: "git-failure",
				target: "swa",
				uiType: "kendo",
				install: false,
				force: false,
				skipGit: false,
			}),
		).rejects.toThrow("rerun with --skip-git");

		const spinner = promptMocks.spinner.mock.results.at(-1)?.value;
		expect(spinner.stop).toHaveBeenCalledWith("Git initialization failed.");
	});
});
