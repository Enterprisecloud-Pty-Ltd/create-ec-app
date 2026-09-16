#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "create-ec-app-smoke-"));
const packedPrefix = path.join(tempRoot, "packed-cli");
// Scaffold through the published tarball, not the repo, so publish-time file
// stripping (for example npm dropping .gitignore) is caught here.
const cliPath = path.join(
	packedPrefix,
	"node_modules",
	"create-ec-app",
	"dist",
	"index.js",
);

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
	execFileSync(npmCmd, ["run", "build"], { cwd: repoRoot, stdio: "inherit" });

	const packOutput = execFileSync(
		npmCmd,
		["pack", "--pack-destination", tempRoot],
		{ cwd: repoRoot, encoding: "utf8" },
	);
	const tarballName = packOutput
		.trim()
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean)
		.pop();
	fs.mkdirSync(packedPrefix, { recursive: true });
	execFileSync(
		npmCmd,
		[
			"install",
			path.join(tempRoot, tarballName),
			"--prefix",
			packedPrefix,
			"--no-save",
			"--ignore-scripts",
			"--no-audit",
			"--no-fund",
		],
		{ cwd: tempRoot, stdio: "inherit" },
	);

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
		assertMissing(
			path.join(projectDir, "package-lock.json"),
			`${projectName} stale template lockfile`,
		);
		const generatedPackageJson = readJson(path.join(projectDir, "package.json"));
		assert(
			generatedPackageJson.name === projectName,
			`${projectName} package.json name should be the project name`,
		);
		const gitignore = fs.readFileSync(path.join(projectDir, ".gitignore"), "utf8");
		assert(
			gitignore.includes("token.json"),
			`${projectName} .gitignore should ignore token.json`,
		);
		assert(
			gitignore.includes("!.vscode/settings.json"),
			`${projectName} .gitignore should keep shared VS Code settings`,
		);
		assertRegularFileContains(
			path.join(projectDir, "CLAUDE.md"),
			"@AGENTS.md",
			`${projectName} Claude guidance pointer`,
		);
		assertRegularFileContains(
			path.join(projectDir, "AGENTS.md"),
			"get_design_context",
			`${projectName} Figma implementation rules`,
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
			assertRegularFileContains(
				path.join(
					projectDir,
					".agents",
					"skills",
					"dynamics-webapi",
					"SKILL.md",
				),
				".agents/skills/dynamics-webapi/scripts/dynamics_api.py",
				`${projectName} Codex Dataverse skill`,
			);
			assertPath(
				path.join(
					projectDir,
					".agents",
					"skills",
					"dynamics-webapi",
					"scripts",
					"dynamics_api.py",
				),
				`${projectName} Dataverse helper script`,
			);
			assertRegularFileContains(
				path.join(
					projectDir,
					".claude",
					"skills",
					"dynamics-webapi",
					"SKILL.md",
				),
				"../../../.agents/skills/dynamics-webapi/SKILL.md",
				`${projectName} Claude Dataverse skill`,
			);
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
			assertFileContains(
				path.join(projectDir, "AGENTS.md"),
				"split Dynamics chrome",
				`${projectName} webresource Figma host boundary`,
			);
		} else {
			assertMissing(
				path.join(projectDir, ".agents", "skills", "dynamics-webapi"),
				`${projectName} target-specific Dataverse skill`,
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
			assertFileContains(
				path.join(projectDir, "AGENTS.md"),
				"split Power Pages site header",
				`${projectName} Power Pages Figma host boundary`,
			);
			if (ui === "kendo") {
				assertFileContains(
					path.join(projectDir, "src", "main.tsx"),
					"<AuthProvider>",
					`${projectName} power pages kendo auth provider`,
				);
				assertFileContains(
					path.join(projectDir, "src", "main.tsx"),
					"@progress/kendo-theme-fluent/dist/all.css",
					`${projectName} power pages kendo theme import`,
				);
			}
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
			assertFileContains(
				path.join(projectDir, "AGENTS.md"),
				"There is no host chrome. The Figma frame is the app.",
				`${projectName} SWA Figma host boundary`,
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
			assertFileContains(
				path.join(projectDir, "AGENTS.md"),
				"split the Power Apps host shell from the React surface",
				`${projectName} Code Apps Figma host boundary`,
			);
		}
	}

	const portalDir = path.join(tempRoot, "portal-wip");
	execFileSync(
		"node",
		[
			cliPath,
			"--project-name",
			"portal-wip",
			"--target",
			"portal",
			"--ui",
			"kendo",
			"--no-install",
			"--skip-git",
		],
		{ cwd: tempRoot, stdio: "pipe" },
	);
	assertPath(path.join(portalDir, "package.json"), "portal-wip package.json");
	assertMissing(path.join(portalDir, "AGENTS.md"), "portal-wip AGENTS.md");
	assertMissing(path.join(portalDir, "CLAUDE.md"), "portal-wip CLAUDE.md");

	const guardedProject = path.join(tempRoot, "existing-project");
	fs.mkdirSync(guardedProject);
	fs.writeFileSync(path.join(guardedProject, "keep.txt"), "do not overwrite");

	let guardOutput;
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
	} catch (error) {
		guardOutput = `${error.stdout ?? ""}${error.stderr ?? ""}`;
	}
	assert(
		guardOutput?.includes("already exists and is not empty"),
		"Existing non-empty directory fails with a clear error",
	);

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
