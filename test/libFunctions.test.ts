import os from "node:os";
import path from "node:path";
import fs from "fs-extra";
import { afterEach, describe, expect, it } from "vitest";
import {
	applyLayer,
	mergeJson,
	readJsonIfExists,
	replaceTokensRecursively,
} from "../src/libFunctions";

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

describe("readJsonIfExists", () => {
	it("returns undefined for missing files and parsed objects for existing files", async () => {
		const rootDir = await makeTempDir();
		const filePath = path.join(rootDir, "package.json");

		await expect(readJsonIfExists(filePath)).resolves.toBeUndefined();

		await fs.writeJson(filePath, { name: "demo" });

		await expect(readJsonIfExists(filePath)).resolves.toEqual({ name: "demo" });
	});

	it("throws when the existing JSON value is not an object", async () => {
		const rootDir = await makeTempDir();
		const filePath = path.join(rootDir, "list.json");
		await fs.writeJson(filePath, ["not", "an", "object"]);

		await expect(readJsonIfExists(filePath)).rejects.toThrow(
			`Expected JSON object in ${filePath}.`,
		);
	});
});

describe("applyLayer", () => {
	it("copies files, applies patch file names, and merges package patches", async () => {
		const rootDir = await makeTempDir();
		const projectDir = path.join(rootDir, "project");
		const layerDir = path.join(rootDir, "layer");

		await fs.outputJson(path.join(projectDir, "package.json"), {
			dependencies: { react: "19.0.0" },
			scripts: { build: "vite build" },
			nested: { replaced: false, removed: true },
		});
		await fs.outputJson(path.join(layerDir, "package.patch.json"), {
			dependencies: { react: "19.2.7" },
			scripts: { test: "vitest run" },
			nested: { replaced: true },
		});
		await fs.outputFile(path.join(layerDir, "src", "App.patch.tsx"), "patched");
		await fs.outputFile(path.join(layerDir, "README.md"), "copied");

		await applyLayer(layerDir, projectDir);

		await expect(fs.readJson(path.join(projectDir, "package.json"))).resolves.toEqual({
			dependencies: { react: "19.2.7" },
			scripts: { build: "vite build", test: "vitest run" },
			nested: { replaced: true },
		});
		await expect(
			fs.readFile(path.join(projectDir, "src", "App.tsx"), "utf8"),
		).resolves.toBe("patched");
		await expect(
			fs.readFile(path.join(projectDir, "README.md"), "utf8"),
		).resolves.toBe("copied");
	});

	it("throws when a JSON patch is not an object", async () => {
		const rootDir = await makeTempDir();
		const projectDir = path.join(rootDir, "project");
		const layerDir = path.join(rootDir, "layer");
		const patchPath = path.join(layerDir, "package.patch.json");
		await fs.outputJson(patchPath, ["bad"]);

		await expect(applyLayer(layerDir, projectDir)).rejects.toThrow(
			`Expected JSON object in ${patchPath}.`,
		);
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

	it("skips files that cannot be read", async () => {
		const rootDir = await makeTempDir();
		const linkPath = path.join(rootDir, "missing-link.txt");
		await fs.symlink(path.join(rootDir, "does-not-exist.txt"), linkPath);

		await expect(
			replaceTokensRecursively(rootDir, { APP_NAME: "demo" }),
		).resolves.toBeUndefined();
	});
});
