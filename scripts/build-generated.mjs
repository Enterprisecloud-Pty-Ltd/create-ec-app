#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// npm supplies its JavaScript entrypoint, so Windows never has to execute npm.cmd.
const npmCli = process.env.npm_execpath;
if (!npmCli) {
	throw new Error("Run this script with npm run build:generated.");
}
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "create-ec-app-build-"));
const packedPrefix = path.join(tempRoot, "packed-cli");
const cliPath = path.join(packedPrefix, "node_modules", "create-ec-app", "dist", "index.js");
let keepTemp = process.env.CREATE_EC_APP_KEEP_GENERATED === "1";

const matrix = [
	["webresource", "kendo"],
	["power-pages", "kendo"],
	["swa", "kendo"],
	["code-apps", "kendo"],
	["webresource", "shadcn-ui"],
	["power-pages", "shadcn-ui"],
	["swa", "shadcn-ui"],
	["code-apps", "shadcn-ui"],
];

try {
	execFileSync(process.execPath, [npmCli, "run", "build"], { cwd: repoRoot, stdio: "inherit" });

	// Build the artifact consumers install, including npm's template-file filtering.
	const packed = JSON.parse(execFileSync(process.execPath,
		[npmCli, "pack", "--json", "--pack-destination", tempRoot],
		{ cwd: repoRoot, encoding: "utf8" }));
	execFileSync(process.execPath, [npmCli, "install", path.join(tempRoot, packed[0].filename),
		"--prefix", packedPrefix, "--no-save", "--ignore-scripts", "--no-audit", "--no-fund"],
		{ cwd: tempRoot, stdio: "inherit" });

	const [npmMajor, npmMinor] = execFileSync(process.execPath, [npmCli, "--version"],
		{ encoding: "utf8" }).trim().split(".").map(Number);

	for (const [target, ui] of matrix) {
		// Exercise default PCF naming for valid npm names that start with digits.
		const projectName = `${target === "webresource" ? "360-" : ""}${target}-${ui}`;
		const projectDir = path.join(tempRoot, projectName);

		try {
			execFileSync(
				process.execPath,
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
			const guidance = fs.readFileSync(path.join(projectDir, "AGENTS.md"), "utf8");
			assert(guidance.includes("get_design_context"), `${projectName} is missing shared agent guidance`);
			assert(!/\{\{[A-Z_]+\}\}/.test(guidance), `${projectName} has unresolved guidance tokens`);
			if (ui === "shadcn-ui") {
				assertShadcnThemeSource(projectDir, projectName);
			}
			execFileSync(process.execPath, [npmCli, "install"], { cwd: projectDir, stdio: "inherit" });
			execFileSync(process.execPath, [npmCli, "ci"], { cwd: projectDir, stdio: "inherit" });
			if (npmMajor > 11 || (npmMajor === 11 && npmMinor >= 19)) {
				const scriptReview = JSON.parse(execFileSync(process.execPath,
					[npmCli, "install-scripts", "ls", "--json"], { cwd: projectDir, encoding: "utf8" }));
				const requiredPending = (scriptReview.allowScripts ?? []).filter((entry) =>
					["keytar", "@progress/kendo-licensing"].includes(entry.name) &&
					entry.changes.some((change) => change.change === "pending"));
				assert.equal(requiredPending.length, 0,
					`${projectName} has unreviewed required lifecycle scripts: ${JSON.stringify(requiredPending)}`);
			}
			execFileSync(process.execPath, [npmCli, "run", "build"], { cwd: projectDir, stdio: "inherit" });
			if (ui === "shadcn-ui") {
				assertBuiltShadcnTheme(projectDir, projectName);
			}
			if (target === "swa") {
				const deployedConfig = JSON.parse(fs.readFileSync(path.join(projectDir, "dist", "staticwebapp.config.json"), "utf8"));
				assert.equal(deployedConfig.navigationFallback.rewrite, "/index.html");
			}
			execFileSync(process.execPath, [npmCli, "run", "lint", "--", "--max-warnings", "0"], { cwd: projectDir, stdio: "inherit" });
			execFileSync(process.execPath, [npmCli, "ls", "typescript", "@typescript/native"], { cwd: projectDir, stdio: "inherit" });
			if (target === "webresource") {
				const pcfDir = path.join(tempRoot, `pcf-${ui}`);
				execFileSync(process.execPath, [cliPath, "--pcf-dir", projectDir,
					"--output", pcfDir, "--namespace", "EC.BuildChecks"],
					{ cwd: projectDir, stdio: "inherit" });
				assert(fs.statSync(path.join(pcfDir, "AGENTS.md")).isFile(), "PCF agent guidance is missing");
				// Conversion also adds runtime/portal files to the source app.
				execFileSync(process.execPath, [npmCli, "run", "build"], { cwd: projectDir, stdio: "inherit" });
				execFileSync(process.execPath, [npmCli, "run", "lint", "--", "--max-warnings", "0"], { cwd: projectDir, stdio: "inherit" });
				execFileSync(process.execPath, [npmCli, "ci"], { cwd: pcfDir, stdio: "inherit" });
				execFileSync(process.execPath, [npmCli, "run", "build"], { cwd: pcfDir, stdio: "inherit" });
				execFileSync(process.execPath, [npmCli, "run", "lint"], { cwd: pcfDir, stdio: "inherit" });
				execFileSync(process.execPath, [path.join(repoRoot, "scripts/check-generated-css-scope.mjs"), pcfDir],
					{ cwd: repoRoot, stdio: "inherit" });
				if (ui === "shadcn-ui") {
					execFileSync(process.execPath, [path.join(repoRoot, "scripts/check-generated-lint.mjs"), projectDir],
						{ cwd: repoRoot, stdio: "inherit" });
				}
			}
		} catch (error) {
			keepTemp = true;
			console.error(`Generated project kept for inspection: ${projectDir}`);
			throw error;
		}
	}

	console.log("Generated project build checks passed.");
	if (keepTemp) console.log(`Generated artifacts retained: ${tempRoot}`);
} finally {
	if (!keepTemp) {
		fs.rmSync(tempRoot, { force: true, recursive: true });
	}
}

function assertShadcnThemeSource(projectDir, projectName) {
	const css = fs.readFileSync(path.join(projectDir, "src", "index.css"), "utf8");
	assert(css.includes("@theme inline"), `${projectName} is missing the shadcn theme mapping`);
	assert(css.includes("--color-background: var(--background);"), `${projectName} is missing the background mapping`);
	assert(css.includes("--color-popover: var(--popover);"), `${projectName} is missing the popover mapping`);
	assert(css.includes("--background: oklch(1 0 0);"), `${projectName} is missing the neutral background token`);
	assert(css.includes("--popover: oklch(1 0 0);"), `${projectName} is missing the neutral popover token`);
}

function assertBuiltShadcnTheme(projectDir, projectName) {
	const distDir = path.join(projectDir, "dist");
	const cssFiles = findFiles(distDir, (filePath) => filePath.endsWith(".css"));
	assert(cssFiles.length > 0, `${projectName} build emitted no CSS`);
	const css = cssFiles.map((filePath) => fs.readFileSync(filePath, "utf8")).join("\n");
	assert(/--background:[^;}]+/.test(css), `${projectName} build is missing --background`);
	assert(/--popover:[^;}]+/.test(css), `${projectName} build is missing --popover`);
	assert(css.includes(".bg-background{background-color:var(--background)}"), `${projectName} build is missing bg-background`);
	assert(css.includes(".bg-popover{background-color:var(--popover)}"), `${projectName} build is missing bg-popover`);
	assert(css.includes(".text-popover-foreground{color:var(--popover-foreground)}"), `${projectName} build is missing text-popover-foreground`);
}

function findFiles(directory, predicate) {
	const files = [];
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		const entryPath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			files.push(...findFiles(entryPath, predicate));
		} else if (predicate(entryPath)) {
			files.push(entryPath);
		}
	}
	return files;
}
