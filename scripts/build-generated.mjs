#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cliPath = path.join(repoRoot, "dist", "index.js");
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "create-ec-app-build-"));
let keepTemp = false;

const matrix = [
	["webresource", "kendo"],
	["swa", "kendo"],
	["code-apps", "kendo"],
	["webresource", "shadcn-ui"],
];

try {
	execFileSync("npm", ["run", "build"], { cwd: repoRoot, stdio: "inherit" });

	for (const [target, ui] of matrix) {
		const projectName = `${target}-${ui}`;
		const projectDir = path.join(tempRoot, projectName);

		try {
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
				{ cwd: tempRoot, stdio: "inherit" },
			);
			execFileSync("npm", ["install"], { cwd: projectDir, stdio: "inherit" });
			execFileSync("npm", ["run", "build"], { cwd: projectDir, stdio: "inherit" });
			execFileSync("npm", ["run", "lint"], { cwd: projectDir, stdio: "inherit" });
		} catch (error) {
			keepTemp = true;
			console.error(`Generated project kept for inspection: ${projectDir}`);
			throw error;
		}
	}

	console.log("Generated project build checks passed.");
} finally {
	if (!keepTemp) {
		fs.rmSync(tempRoot, { force: true, recursive: true });
	}
}
