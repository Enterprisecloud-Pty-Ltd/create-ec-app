import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { stripVTControlCharacters } from "node:util";

const require = createRequire(import.meta.url);
const task = process.argv[2];
const child = spawnSync(process.execPath, [
	require.resolve("pcf-scripts/bin/pcf-scripts.js"),
	...process.argv.slice(2),
], { encoding: "utf8", stdio: ["inherit", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });

process.stdout.write(child.stdout ?? "");
process.stderr.write(child.stderr ?? "");
if (child.error) throw child.error;

// pcf-scripts 1.51.1 can return zero after TaskRunner reports a compiler failure.
const output = stripVTControlCharacters(`${child.stdout ?? ""}\n${child.stderr ?? ""}`);
if (child.status !== 0 || !output.includes(`[${task}] Succeeded`) || output.includes(`[${task}] Failed`)) {
	console.error(`PCF ${task} did not complete successfully.`);
	process.exitCode = 1;
}
