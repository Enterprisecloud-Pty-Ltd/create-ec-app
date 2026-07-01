import os from "node:os";
import path from "node:path";
import fs from "fs-extra";
import { afterEach, describe, expect, it, vi } from "vitest";
import { scaffoldProject } from "../src/index";
import {
	normalizeRegistryUrl,
	parseDependencySpecifier,
	resolveRegistryTargetPath,
	toRegistryItemUrl,
	toRegistryItemUrlTemplate,
	toRegistryNamespace,
} from "../src/shadcnRegistry";

const tempDirs: string[] = [];
const originalCwd = process.cwd();

afterEach(async () => {
	process.chdir(originalCwd);
	vi.unstubAllGlobals();
	await Promise.all(tempDirs.splice(0).map((dir) => fs.remove(dir)));
});

async function makeTempDir(): Promise<string> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), "create-ec-app-registry-"));
	tempDirs.push(dir);
	return dir;
}

function mockFetch(responses: Record<string, unknown | Response>) {
	const fetchMock = vi.fn(async (input: string | URL | Request) => {
		const url =
			typeof input === "string"
				? input
				: input instanceof URL
					? input.toString()
					: input.url;
		const response = responses[url];

		if (response instanceof Response) {
			return response;
		}

		if (response === undefined) {
			return new Response("not found", {
				status: 404,
				statusText: "Not Found",
			});
		}

		return new Response(JSON.stringify(response), {
			headers: { "content-type": "application/json" },
			status: 200,
		});
	});

	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

async function expectRegistryItemFailure(
	itemPayload: unknown,
	expectedMessage: string,
): Promise<void> {
	const rootDir = await makeTempDir();
	process.chdir(rootDir);
	mockFetch({
		"https://example.com/r/registry.json": { items: [{ name: "button" }] },
		"https://example.com/r/button.json": itemPayload,
	});

	await expect(
		scaffoldProject({
			projectName: "bad-registry-item",
			target: "swa",
			uiType: "shadcn-ui",
			shadcnRegistry: "https://example.com/r/registry.json",
			install: false,
			force: false,
			skipGit: true,
		}),
	).rejects.toThrow(expectedMessage);
}

describe("custom shadcn registry scaffolding", () => {
	it("installs registry files, dependencies, and namespace without vendored components", async () => {
		const rootDir = await makeTempDir();
		process.chdir(rootDir);
		const registryUrl = "https://example.com/r/registry.json";
		const fetchMock = mockFetch({
			[registryUrl]: {
				name: "EC Registry",
				items: [
					{ name: "utils" },
					{ name: "button" },
					{ name: "guide" },
					{ name: "raw-file" },
				],
			},
			"https://example.com/r/utils.json": {
				name: "utils",
				dependencies: ["clsx@^2.1.1", "tailwind-merge@^3.6.0"],
				files: [
					{
						path: "src/lib/utils.ts",
						content: "export function cn() { return 'registry' }\n",
						target: "@lib/utils.ts",
					},
				],
			},
			"https://example.com/r/button.json": {
				name: "button",
				dependencies: [
					"@scope/package@1.2.3",
					"class-variance-authority@^0.7.1",
					"plain-package",
				],
				devDependencies: ["tw-animate-css@^1.4.0"],
				files: [
					{
						path: "src/components/ui/button.tsx",
						content: "export function Button() { return null }\n",
						target: "@ui/button.tsx",
					},
				],
			},
			"https://example.com/r/guide.json": {
				name: "guide",
				files: [
					{
						path: "AGENTS.md",
						content: "Registry instructions\n",
						target: "~/AGENTS.md",
					},
				],
			},
			"https://example.com/r/raw-file.json": {
				files: [
					{
						path: "src/components/raw-file.tsx",
						content: "export const rawFile = true\n",
					},
				],
			},
		});

		await scaffoldProject({
			projectName: "registry-demo",
			target: "swa",
			uiType: "shadcn-ui",
			shadcnRegistry: registryUrl,
			install: false,
			force: false,
			skipGit: true,
		});

		const projectDir = path.join(rootDir, "registry-demo");
		await expect(
			fs.readFile(path.join(projectDir, "src", "components", "ui", "button.tsx"), "utf8"),
		).resolves.toBe("export function Button() { return null }\n");
		await expect(
			fs.readFile(path.join(projectDir, "src", "lib", "utils.ts"), "utf8"),
		).resolves.toContain("registry");
		await expect(fs.readFile(path.join(projectDir, "AGENTS.md"), "utf8")).resolves.toBe(
			"Registry instructions\n",
		);
		await expect(
			fs.readFile(path.join(projectDir, "src", "components", "raw-file.tsx"), "utf8"),
		).resolves.toBe("export const rawFile = true\n");
		await expect(
			fs.pathExists(path.join(projectDir, "src", "components", "ui", "accordion.tsx")),
		).resolves.toBe(false);

		await expect(fs.readJson(path.join(projectDir, "package.json"))).resolves.toMatchObject({
			dependencies: {
				"@scope/package": "1.2.3",
				"class-variance-authority": "^0.7.1",
				clsx: "^2.1.1",
				"plain-package": "*",
				shadcn: "4.12.0",
				"tailwind-merge": "^3.6.0",
			},
			devDependencies: {
				"tw-animate-css": "^1.4.0",
			},
		});
		await expect(fs.readJson(path.join(projectDir, "components.json"))).resolves.toMatchObject({
			registries: {
				"@ec-registry": "https://example.com/r/{name}.json",
			},
		});
		expect(fetchMock).toHaveBeenCalledTimes(5);
	});

	it("handles registry items without dev dependencies", async () => {
		const rootDir = await makeTempDir();
		process.chdir(rootDir);
		mockFetch({
			"https://example.com/r/registry.json": {
				name: "minimal",
				items: [{ name: "button" }],
			},
			"https://example.com/r/button.json": {
				name: "button",
				dependencies: ["clsx@^2.1.1"],
				files: [
					{
						path: "src/components/ui/button.tsx",
						content: "export function Button() { return null }\n",
						target: "@ui/button.tsx",
					},
				],
			},
		});

		await scaffoldProject({
			projectName: "no-dev-deps",
			target: "swa",
			uiType: "shadcn-ui",
			shadcnRegistry: "https://example.com/r/registry.json",
			install: false,
			force: false,
			skipGit: true,
		});

		await expect(
			fs.readJson(path.join(rootDir, "no-dev-deps", "package.json")),
		).resolves.toMatchObject({
			dependencies: {
				clsx: "^2.1.1",
				shadcn: "4.12.0",
			},
		});
	});

	it("applies registry CSS variables and imports when items provide styling", async () => {
		const rootDir = await makeTempDir();
		process.chdir(rootDir);
		const registryUrl = "https://example.com/r/registry.json";
		mockFetch({
			[registryUrl]: {
				name: "EC Registry",
				items: [{ name: "ec-theme" }],
			},
			"https://example.com/r/ec-theme.json": {
				name: "ec-theme",
				dependencies: ["tw-animate-css@^1.4.0"],
				cssVars: {
					theme: {
						"font-sans": "Inter, sans-serif",
						"--animate-wiggle": "wiggle 1s ease-in-out infinite",
					},
					light: {
						background: "#ffffff",
						foreground: "#111111",
					},
					dark: {
						background: "#111111",
					},
				},
				css: {
					'@import "tailwindcss"': {},
					'@import "tw-animate-css"': {},
					"@custom-variant dark (&:is(.dark *))": {},
					"@layer base": {
						"*": {
							"@apply border-border outline-ring/50": {},
						},
						body: {
							"font-size": "14px",
							"@apply bg-background text-foreground": {},
						},
					},
				},
			},
		});

		await scaffoldProject({
			projectName: "styled-registry",
			target: "swa",
			uiType: "shadcn-ui",
			shadcnRegistry: registryUrl,
			install: false,
			force: false,
			skipGit: true,
		});

		const projectDir = path.join(rootDir, "styled-registry");
		const css = await fs.readFile(path.join(projectDir, "src", "index.css"), "utf8");

		expect(css.match(/@import "tailwindcss";/g)).toHaveLength(1);
		expect(css).toContain(
			'@import "shadcn/tailwind.css";\n@import "tw-animate-css";',
		);
		expect(css).toContain("@theme inline");
		expect(css).toContain("--font-sans: Inter, sans-serif;");
		expect(css).toContain(
			"--animate-wiggle: wiggle 1s ease-in-out infinite;",
		);
		expect(css).toContain(":root {\n  --background: #ffffff;");
		expect(css).toContain(".dark {\n  --background: #111111;");
		expect(css).toContain("@custom-variant dark (&:is(.dark *));");
		expect(css).toContain("@apply border-border outline-ring/50;");
		expect(css).toContain("font-size: 14px;");
		await expect(fs.readJson(path.join(projectDir, "package.json"))).resolves.toMatchObject({
			dependencies: {
				shadcn: "4.12.0",
				"tw-animate-css": "^1.4.0",
			},
		});
	});

	it("supports registry styles that only add CSS imports", async () => {
		const rootDir = await makeTempDir();
		process.chdir(rootDir);
		mockFetch({
			"https://example.com/r/registry.json": {
				name: "imports-only",
				items: [{ name: "animations" }],
			},
			"https://example.com/r/animations.json": {
				name: "animations",
				css: {
					'@import "tw-animate-css"': {},
				},
			},
		});

		await scaffoldProject({
			projectName: "imports-only",
			target: "swa",
			uiType: "shadcn-ui",
			shadcnRegistry: "https://example.com/r/registry.json",
			install: false,
			force: false,
			skipGit: true,
		});

		await expect(
			fs.readFile(path.join(rootDir, "imports-only", "src", "index.css"), "utf8"),
		).resolves.toContain('@import "tw-animate-css";');
	});

	it("installs registry theme files and imports them into app CSS", async () => {
		const rootDir = await makeTempDir();
		process.chdir(rootDir);
		mockFetch({
			"https://example.com/r/registry.json": {
				name: "ec-registry",
				items: [{ name: "ec-theme" }],
			},
			"https://example.com/r/ec-theme.json": {
				name: "ec-theme",
				dependencies: ["tw-animate-css@^1.4.0"],
				css: {
					'@import "tw-animate-css"': {},
					'@import "./ec-theme.css"': {},
				},
				files: [
					{
						path: "ec-theme.css",
						content: ":root:root { --primary: #0f6cbd; }\n",
						target: "src/ec-theme.css",
					},
				],
			},
		});

		await scaffoldProject({
			projectName: "theme-file",
			target: "webresource",
			uiType: "shadcn-ui",
			shadcnRegistry: "https://example.com/r/registry.json",
			install: false,
			force: false,
			skipGit: true,
		});

		const projectDir = path.join(rootDir, "theme-file");
		await expect(
			fs.readFile(path.join(projectDir, "src", "ec-theme.css"), "utf8"),
		).resolves.toBe(":root:root { --primary: #0f6cbd; }\n");
		await expect(
			fs.readFile(path.join(projectDir, "src", "index.css"), "utf8"),
		).resolves.toContain('@import "./ec-theme.css";');
	});

	it("reports registry fetch and JSON failures", async () => {
		const rootDir = await makeTempDir();
		process.chdir(rootDir);
		mockFetch({
			"https://example.com/r/registry.json": new Response("missing", {
				status: 404,
				statusText: "Not Found",
			}),
		});

		await expect(
			scaffoldProject({
				projectName: "missing-registry",
				target: "swa",
				uiType: "shadcn-ui",
				shadcnRegistry: "https://example.com/r/registry.json",
				install: false,
				force: false,
				skipGit: true,
			}),
		).rejects.toThrow("Failed to fetch shadcn registry JSON");

		const invalidJsonRoot = await makeTempDir();
		process.chdir(invalidJsonRoot);
		mockFetch({
			"https://example.com/r/registry.json": new Response("<!DOCTYPE html>", {
				status: 200,
			}),
		});

		await expect(
			scaffoldProject({
				projectName: "html-registry",
				target: "swa",
				uiType: "shadcn-ui",
				shadcnRegistry: "https://example.com/r/registry.json",
				install: false,
				force: false,
				skipGit: true,
			}),
		).rejects.toThrow("response was not valid JSON");
	});

	it("reports invalid registry catalogs", async () => {
		const rootDir = await makeTempDir();
		process.chdir(rootDir);
		mockFetch({
			"https://example.com/r/registry.json": { name: "bad" },
		});

		await expect(
			scaffoldProject({
				projectName: "bad-registry",
				target: "swa",
				uiType: "shadcn-ui",
				shadcnRegistry: "https://example.com/r/registry.json",
				install: false,
				force: false,
				skipGit: true,
			}),
		).rejects.toThrow("Expected a shadcn registry catalog");
	});

	it("reports invalid catalog item names", async () => {
		const rootDir = await makeTempDir();
		process.chdir(rootDir);
		mockFetch({
			"https://example.com/r/registry.json": { items: [{}] },
		});

		await expect(
			scaffoldProject({
				projectName: "bad-registry-item-name",
				target: "swa",
				uiType: "shadcn-ui",
				shadcnRegistry: "https://example.com/r/registry.json",
				install: false,
				force: false,
				skipGit: true,
			}),
		).rejects.toThrow("to include a name");
	});

	it("reports invalid registry item payloads", async () => {
		await expectRegistryItemFailure([], "Expected a shadcn registry item object");
	});

	it("reports registry items without files", async () => {
		await expectRegistryItemFailure(
			{ name: "button" },
			'Expected registry item "button" to include files or styling',
		);
	});

	it("reports invalid dependency and file entries", async () => {
		await expectRegistryItemFailure(
			{
				name: "button",
				dependencies: [1],
				files: [
					{
						path: "src/components/ui/button.tsx",
						content: "export {}\n",
					},
				],
			},
			"Expected dependencies",
		);
		await expectRegistryItemFailure(
			{ name: "button", files: "bad" },
			'Expected files for registry item "button" to be an array',
		);
		await expectRegistryItemFailure(
			{ name: "button", files: [null] },
			'Expected file 0 for registry item "button" to be an object',
		);
		await expectRegistryItemFailure(
			{ name: "button", files: [{ content: "export {}\n" }] },
			'Expected file 0 for registry item "button" to include a path',
		);
		await expectRegistryItemFailure(
			{ name: "button", files: [{ path: "src/components/ui/button.tsx" }] },
			'Expected file "src/components/ui/button.tsx" for registry item "button" to include content',
		);
		await expectRegistryItemFailure(
			{
				name: "button",
				files: [
					{
						path: "src/components/ui/button.tsx",
						content: "export {}\n",
						target: "",
					},
				],
			},
			'Expected file "src/components/ui/button.tsx" for registry item "button" to include a valid target',
		);
	});

	it("reports invalid registry CSS entries", async () => {
		await expectRegistryItemFailure(
			{
				name: "theme",
				css: [],
			},
			'Expected css for registry item "button" to be an object',
		);
		await expectRegistryItemFailure(
			{
				name: "theme",
				css: {
					body: true,
				},
			},
			'Expected css for registry item "button" to contain CSS values or nested objects',
		);
		await expectRegistryItemFailure(
			{
				name: "theme",
				cssVars: "bad",
			},
			'Expected cssVars for registry item "button" to be an object',
		);
		await expectRegistryItemFailure(
			{
				name: "theme",
				cssVars: {
					light: "bad",
				},
			},
			'Expected cssVars.light for registry item "button" to be an object',
		);
		await expectRegistryItemFailure(
			{
				name: "theme",
				cssVars: {
					light: {
						background: 1,
					},
				},
			},
			'Expected cssVars.light.background for registry item "button" to be a string',
		);
	});
});

describe("registry helper functions", () => {
	it("parses npm dependency specifiers", () => {
		expect(parseDependencySpecifier("zod")).toEqual(["zod", "*"]);
		expect(parseDependencySpecifier("zod@^4.0.0")).toEqual(["zod", "^4.0.0"]);
		expect(parseDependencySpecifier("@scope/package@1.2.3")).toEqual([
			"@scope/package",
			"1.2.3",
		]);
		expect(() => parseDependencySpecifier("")).toThrow("cannot be empty");
		expect(() => parseDependencySpecifier("zod@")).toThrow("Invalid dependency");
	});

	it("resolves supported registry target placeholders inside the project", async () => {
		const projectDir = await makeTempDir();

		expect(path.relative(projectDir, resolveRegistryTargetPath(projectDir, "@components/card.tsx"))).toBe(
			path.join("src", "components", "card.tsx"),
		);
		expect(path.relative(projectDir, resolveRegistryTargetPath(projectDir, "@ui/button.tsx"))).toBe(
			path.join("src", "components", "ui", "button.tsx"),
		);
		expect(path.relative(projectDir, resolveRegistryTargetPath(projectDir, "@lib/utils.ts"))).toBe(
			path.join("src", "lib", "utils.ts"),
		);
		expect(path.relative(projectDir, resolveRegistryTargetPath(projectDir, "@hooks/use-demo.ts"))).toBe(
			path.join("src", "hooks", "use-demo.ts"),
		);
		expect(path.relative(projectDir, resolveRegistryTargetPath(projectDir, "~/AGENTS.md"))).toBe(
			"AGENTS.md",
		);
		expect(path.relative(projectDir, resolveRegistryTargetPath(projectDir, "@/pages/home.tsx"))).toBe(
			path.join("src", "pages", "home.tsx"),
		);
		expect(path.relative(projectDir, resolveRegistryTargetPath(projectDir, "docs/readme.md"))).toBe(
			path.join("docs", "readme.md"),
		);
		expect(() => resolveRegistryTargetPath(projectDir, "/tmp/outside.ts")).toThrow(
			"must be relative",
		);
		expect(() => resolveRegistryTargetPath(projectDir, "../outside.ts")).toThrow(
			"escapes the project directory",
		);
	});

	it("normalizes registry URLs and builds item URLs", () => {
		expect(normalizeRegistryUrl("https://example.com/r/registry.json")).toBe(
			"https://example.com/r/registry.json",
		);
		expect(() => normalizeRegistryUrl("https://example.com")).toThrow(
			"Use a registry.json URL",
		);
		expect(() => normalizeRegistryUrl("https://example.com/r")).toThrow(
			"Use a registry.json URL",
		);
		expect(() => normalizeRegistryUrl("https://example.com/r/")).toThrow(
			"Use a registry.json URL",
		);
		expect(() => normalizeRegistryUrl("https://example.com/custom.json")).toThrow(
			"Use a registry.json URL",
		);
		expect(() => normalizeRegistryUrl("not a url")).toThrow("Invalid shadcn registry URL");
		expect(() => normalizeRegistryUrl("file:///tmp/registry.json")).toThrow(
			"Unsupported shadcn registry URL",
		);
		expect(toRegistryItemUrl("https://example.com/r/registry.json", "button")).toBe(
			"https://example.com/r/button.json",
		);
		expect(
			toRegistryItemUrlTemplate("https://example.com/r/registry.json?version=1"),
		).toBe("https://example.com/r/{name}.json?version=1");
		expect(toRegistryItemUrlTemplate("https://example.com/r/")).toBe(
			"https://example.com/r/{name}.json",
		);
		expect(toRegistryNamespace("EC Registry!")).toBe("@ec-registry");
		expect(toRegistryNamespace("!!!")).toBe("@custom");
	});
});
