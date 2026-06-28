import os from "node:os";
import path from "node:path";
import fs from "fs-extra";
import { afterEach, describe, expect, it } from "vitest";
import { mergeJson, replaceTokensRecursively } from "../src/libFunctions";

const tempDirs: string[] = [];

afterEach(async () => {
	await Promise.all(tempDirs.splice(0).map((dir) => fs.remove(dir)));
});

async function makeTempDir(): Promise<string> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), "create-ec-app-test-"));
	tempDirs.push(dir);
	return dir;
}

describe("mergeJson", () => {
	it("deep merges dependency and script sections", () => {
		const merged = mergeJson(
			{
				dependencies: { react: "19.0.0", zod: "4.0.0" },
				devDependencies: { typescript: "5.0.0" },
				peerDependencies: { react: ">=18" },
				scripts: { build: "vite build" },
			},
			{
				dependencies: { react: "19.2.7", zustand: "5.0.14" },
				devDependencies: { vitest: "4.1.9" },
				peerDependencies: { "react-dom": ">=18" },
				scripts: { test: "vitest run" },
			},
		);

		expect(merged).toEqual({
			dependencies: {
				react: "19.2.7",
				zod: "4.0.0",
				zustand: "5.0.14",
			},
			devDependencies: { typescript: "5.0.0", vitest: "4.1.9" },
			peerDependencies: { react: ">=18", "react-dom": ">=18" },
			scripts: { build: "vite build", test: "vitest run" },
		});
	});

	it("shallow overrides unrelated root keys", () => {
		const merged = mergeJson(
			{ name: "base", nested: { keep: true, remove: true } },
			{ nested: { keep: false } },
		);

		expect(merged).toEqual({
			name: "base",
			nested: { keep: false },
		});
	});
});

describe("replaceTokensRecursively", () => {
	it("replaces tokens in nested files and handles multiple tokens", async () => {
		const rootDir = await makeTempDir();
		await fs.outputFile(
			path.join(rootDir, "src", "App.tsx"),
			"{{APP_NAME}} uses {{TARGET}} with {{UI}}. {{APP_NAME}}",
		);

		await replaceTokensRecursively(rootDir, {
			APP_NAME: "demo",
			TARGET: "webresource",
			UI: "shadcn-ui",
		});

		await expect(
			fs.readFile(path.join(rootDir, "src", "App.tsx"), "utf8"),
		).resolves.toBe("demo uses webresource with shadcn-ui. demo");
	});

	it("leaves files unchanged when no tokens exist", async () => {
		const rootDir = await makeTempDir();
		const filePath = path.join(rootDir, "plain.txt");
		await fs.writeFile(filePath, "no placeholders here", "utf8");

		await replaceTokensRecursively(rootDir, { APP_NAME: "demo" });

		await expect(fs.readFile(filePath, "utf8")).resolves.toBe(
			"no placeholders here",
		);
	});

	it("skips binary-ish files without crashing", async () => {
		const rootDir = await makeTempDir();
		const filePath = path.join(rootDir, "asset.bin");
		const original = Buffer.from([0, 123, 123, 65, 80, 80, 95, 78, 65, 77, 69]);
		await fs.writeFile(filePath, original);

		await replaceTokensRecursively(rootDir, { APP_NAME: "demo" });

		await expect(fs.readFile(filePath)).resolves.toEqual(original);
	});
});
