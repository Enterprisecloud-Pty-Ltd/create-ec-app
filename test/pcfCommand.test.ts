import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import fs from "fs-extra";
import { afterEach, expect, it } from "vitest";

const temporaryDirs: string[] = [];
afterEach(async () => {
	await Promise.all(temporaryDirs.splice(0).map((directory) => fs.remove(directory)));
});

it.each([
	{ task: "build", output: "[build] Succeeded", status: 0, expected: 0 },
	{ task: "lint", output: "[lint] Succeeded", status: 0, expected: 0 },
	{ task: "build", output: "webpack compiled with 3 errors\n[build] Failed", status: 0, expected: 1 },
	{ task: "lint", output: "[lint] Failed", status: 0, expected: 1 },
	{ task: "build", output: "[build] Succeeded", status: 1, expected: 1 },
	{ task: "build", output: "[build] Initializing...", status: 0, expected: 1 },
])("rejects false PCF success: $task/$output/$status", async ({ task, output, status, expected }) => {
	const directory = await fs.mkdtemp(path.join(os.tmpdir(), "pcf-command-"));
	temporaryDirs.push(directory);
	await fs.copy(path.resolve("templates/pcf/base/scripts/run-pcf.mjs"), path.join(directory, "run-pcf.mjs"));
	await fs.outputFile(path.join(directory, "node_modules/pcf-scripts/bin/pcf-scripts.js"),
		`console.log(${JSON.stringify(output)}); process.exitCode = ${status};`);
	const child = spawnSync(process.execPath, [path.join(directory, "run-pcf.mjs"), task], {
		cwd: directory, encoding: "utf8",
	});
	expect(child.error).toBeUndefined();
	expect(child.stdout).toContain(output);
	expect(child.status).toBe(expected);
});
