import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import { afterEach, describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const tempDirs: string[] = [];

afterEach(async () => {
	await Promise.all(tempDirs.splice(0).map((dir) => fs.remove(dir)));
});

describe("repository check scripts", () => {
	it.each(["build-generated.mjs", "smoke-scaffold.mjs"])(
		"%s launches npm's JavaScript entrypoint with spaces and shell characters in its path",
		async (script) => {
			const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "create-ec-app-npm-"));
			tempDirs.push(rootDir);
			const npmCli = path.join(rootDir, "npm cli & fixture", "npm-cli.mjs");
			const invocationPath = path.join(rootDir, "invocation.json");
			await fs.outputFile(npmCli, `
import { writeFileSync } from "node:fs";
writeFileSync(process.env.NPM_INVOCATION_PATH, JSON.stringify({
	args: process.argv.slice(2),
	cwd: process.cwd(),
}));
// Stop at the npm boundary so this test cannot install dependencies or run the matrix.
process.exit(17);
`);

			const child = spawnSync(process.execPath, [path.join(repoRoot, "scripts", script)], {
				cwd: rootDir,
				encoding: "utf8",
				env: { ...process.env, npm_execpath: npmCli, NPM_INVOCATION_PATH: invocationPath },
			});

			expect(child.error).toBeUndefined();
			expect(child.status).toBe(1);
			expect(await fs.readJson(invocationPath)).toEqual({
				args: ["run", "build"],
				cwd: await fs.realpath(repoRoot),
			});
		},
	);
});
