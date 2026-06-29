#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cliPath = path.join(repoRoot, "dist", "index.js");
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "create-ec-app-smoke-"));

const matrix = [
	["webresource", "kendo"],
	["webresource", "shadcn-ui"],
	["power-pages", "kendo"],
	["power-pages", "shadcn-ui"],
	["swa", "kendo"],
	["swa", "shadcn-ui"],
	["code-apps", "kendo"],
	["code-apps", "shadcn-ui"],
];

try {
	execFileSync("npm", ["run", "build"], { cwd: repoRoot, stdio: "inherit" });

	const helpOutput = execFileSync("node", [cliPath, "--help"], {
		cwd: tempRoot,
		encoding: "utf8",
		stdio: "pipe",
	});
	assert(
		helpOutput.includes("create-ec-app --project-name my-app"),
		"Help output includes scaffold examples",
	);
	assert(helpOutput.includes("--skip-git"), "Help output documents --skip-git");
	assert(helpOutput.includes("--force"), "Help output documents --force");

	for (const [target, ui] of matrix) {
		const projectName = `${target}-${ui}`;
		const projectDir = path.join(tempRoot, projectName);

		execFileSync(
			"node",
			[
				cliPath,
				"--project-name",
				projectName,
				"--target",
				target,
				"--ui",
				ui,
				"--no-install",
				"--skip-git",
			],
			{ cwd: tempRoot, stdio: "pipe" },
		);

		assertPath(projectDir, `${projectName} project folder`);
		assertPath(path.join(projectDir, "package.json"), `${projectName} package.json`);
		assertPath(path.join(projectDir, "src", "App.tsx"), `${projectName} App.tsx`);
		assertMissing(path.join(projectDir, ".git"), `${projectName} .git directory`);
		assertRegularFileContains(
			path.join(projectDir, "CLAUDE.md"),
			"@AGENTS.md",
			`${projectName} Claude guidance pointer`,
		);

		if (ui === "shadcn-ui") {
			assertPath(
				path.join(projectDir, "components.json"),
				`${projectName} components.json`,
			);
			assertPath(
				path.join(projectDir, "src", "components", "ui"),
				`${projectName} shadcn components directory`,
			);
			assertPath(
				path.join(projectDir, "src", "components", "ui", "button.tsx"),
				`${projectName} shadcn button`,
			);
			assertPath(
				path.join(projectDir, "src", "lib", "utils.ts"),
				`${projectName} shadcn utils`,
			);
		}

		if (ui === "kendo") {
			const packageJson = readJson(path.join(projectDir, "package.json"));
			assert(
				packageJson.dependencies?.["@progress/kendo-react-buttons"],
				`${projectName} has Kendo dependencies`,
			);
			assertFileContains(
				path.join(projectDir, "src", "main.tsx"),
				"@progress/kendo-theme-fluent/dist/all.css",
				`${projectName} imports Kendo theme CSS`,
			);
		}

		if (target === "webresource") {
			assertPath(
				path.join(projectDir, "src", "services", "AuthService.ts"),
				`${projectName} webresource auth service`,
			);
			assertPath(path.join(projectDir, "token.json"), `${projectName} token.json`);
			assertFileContains(
				path.join(projectDir, "vite.config.ts"),
				'base: "./"',
				`${projectName} webresource base config`,
			);
			assertFileContains(
				path.join(projectDir, "vite.config.ts"),
				"cssCodeSplit: false",
				`${projectName} webresource cssCodeSplit config`,
			);
		}

		if (target === "power-pages") {
			assertPath(
				path.join(projectDir, "src", "context", "AuthContext.tsx"),
				`${projectName} power pages auth context`,
			);
			assertPath(
				path.join(projectDir, "src", "components", "shared", "AuthError.tsx"),
				`${projectName} power pages auth error component`,
			);
		}

		if (target === "swa") {
			assertPath(
				path.join(projectDir, "staticwebapp.config.json"),
				`${projectName} staticwebapp.config.json`,
			);
			assertPath(
				path.join(projectDir, "swa-cli.config.json"),
				`${projectName} swa-cli.config.json`,
			);
		}

		if (target === "code-apps") {
			assertPath(
				path.join(projectDir, "power.config.example.json"),
				`${projectName} power.config.example.json`,
			);
			assertFileContains(
				path.join(projectDir, "vite.config.ts"),
				"powerApps()",
				`${projectName} vite powerApps plugin`,
			);
			assertMissing(path.join(projectDir, "token.json"), `${projectName} token.json`);
			assertMissing(
				path.join(projectDir, "src", "services", "AuthService.ts"),
				`${projectName} webresource auth service`,
			);
		}
	}

	const guardedProject = path.join(tempRoot, "existing-project");
	fs.mkdirSync(guardedProject);
	fs.writeFileSync(path.join(guardedProject, "keep.txt"), "do not overwrite");

	try {
		execFileSync(
			"node",
			[
				cliPath,
				"--project-name",
				"existing-project",
				"--target",
				"webresource",
				"--ui",
				"kendo",
				"--no-install",
				"--skip-git",
			],
			{ cwd: tempRoot, encoding: "utf8", stdio: "pipe" },
		);
		throw new Error("Expected existing non-empty project directory to fail");
	} catch (error) {
		const output = `${error.stdout ?? ""}${error.stderr ?? ""}`;
		assert(
			output.includes("already exists and is not empty"),
			"Existing non-empty directory fails with a clear error",
		);
	}

	execFileSync(
		"node",
		[
			cliPath,
			"--project-name",
			"existing-project",
			"--target",
			"webresource",
			"--ui",
			"kendo",
			"--no-install",
			"--skip-git",
			"--force",
		],
		{ cwd: tempRoot, stdio: "pipe" },
	);
	assertMissing(
		path.join(guardedProject, "keep.txt"),
		"forced scaffold marker file",
	);
	assertPath(
		path.join(guardedProject, "package.json"),
		"forced scaffold package.json",
	);

	console.log("Scaffold smoke checks passed.");
} finally {
	fs.rmSync(tempRoot, { force: true, recursive: true });
}

function readJson(filePath) {
	return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function assertPath(filePath, label) {
	assert(fs.existsSync(filePath), `Missing ${label}: ${filePath}`);
}

function assertMissing(filePath, label) {
	assert(!fs.existsSync(filePath), `Expected ${label} to be absent: ${filePath}`);
}

function assertFileContains(filePath, expected, label) {
	const source = fs.readFileSync(filePath, "utf8");
	assert(source.includes(expected), `${label} did not contain ${expected}`);
}

function assertRegularFileContains(filePath, expected, label) {
	const stat = fs.lstatSync(filePath);
	assert(stat.isFile(), `${label} should be a regular file: ${filePath}`);
	assertFileContains(filePath, expected, label);
}

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}
