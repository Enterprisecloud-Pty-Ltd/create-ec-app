import os from "node:os";
import path from "node:path";
import fs from "fs-extra";
import { afterEach, describe, expect, it } from "vitest";
import {
	composeAgentsMarkdown,
	parseAgentsHostOverlay,
	writeScaffoldAgentsMarkdown,
} from "../src/agentsMd";

const tempDirs: string[] = [];

afterEach(async () => {
	await Promise.all(tempDirs.splice(0).map((dir) => fs.remove(dir)));
});

async function makeTempDir(): Promise<string> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), "create-ec-app-agents-"));
	tempDirs.push(dir);
	return dir;
}

describe("parseAgentsHostOverlay", () => {
	it("returns the full content when no markers are present", () => {
		expect(parseAgentsHostOverlay("## Purpose\n\nHost only.\n")).toEqual({
			body: "## Purpose\n\nHost only.",
			figmaHost: "",
			checksExtra: "",
		});
	});

	it("parses a checks-only overlay", () => {
		expect(
			parseAgentsHostOverlay(
				"## Purpose\n\nHost.\n\n<!-- checks-extra -->\n- extra check\n",
			),
		).toEqual({
			body: "## Purpose\n\nHost.",
			figmaHost: "",
			checksExtra: "- extra check",
		});
	});

	it("parses a figma-only overlay", () => {
		expect(
			parseAgentsHostOverlay(
				"## Purpose\n\nHost.\n\n<!-- figma-host -->\nNo host chrome.\n",
			),
		).toEqual({
			body: "## Purpose\n\nHost.",
			figmaHost: "No host chrome.",
			checksExtra: "",
		});
	});

	it("parses figma then checks markers", () => {
		expect(
			parseAgentsHostOverlay(
				"## Purpose\n\nHost.\n\n<!-- figma-host -->\nSplit chrome.\n\n<!-- checks-extra -->\n- extra check\n",
			),
		).toEqual({
			body: "## Purpose\n\nHost.",
			figmaHost: "Split chrome.",
			checksExtra: "- extra check",
		});
	});

	it("parses checks then figma markers", () => {
		expect(
			parseAgentsHostOverlay(
				"## Purpose\n\nHost.\n\n<!-- checks-extra -->\n- extra check\n\n<!-- figma-host -->\nSplit chrome.\n",
			),
		).toEqual({
			body: "## Purpose\n\nHost.",
			figmaHost: "Split chrome.",
			checksExtra: "- extra check",
		});
	});
});

describe("composeAgentsMarkdown", () => {
	it("inserts host, figma, and extra checks into the shared core", () => {
		const composed = composeAgentsMarkdown(
			"## Purpose\n\nWeb resource.\n\n<!-- figma-host -->\nSplit Dynamics chrome.\n\n<!-- checks-extra -->\n- extra check\n",
			"## UI\n\n{{FIGMA_HOST}}\n\n## Checks\n\n- lint\n{{CHECKS_EXTRA}}- figma check\n",
		);

		expect(composed).toBe(
			"## Purpose\n\nWeb resource.\n\n## UI\n\nSplit Dynamics chrome.\n\n## Checks\n\n- lint\n- extra check\n- figma check\n",
		);
	});

	it("omits extra checks when the overlay leaves them empty", () => {
		const composed = composeAgentsMarkdown(
			"## Purpose\n\nHost.\n",
			"## UI\n\n{{FIGMA_HOST}}\n\n## Checks\n\n- lint\n{{CHECKS_EXTRA}}- figma check\n",
		);

		expect(composed).toBe(
			"## Purpose\n\nHost.\n\n## UI\n\n\n## Checks\n\n- lint\n- figma check\n",
		);
	});

	it("strips an unwrapped empty Figma token", () => {
		expect(composeAgentsMarkdown("## Purpose\n\nHost.", "UI {{FIGMA_HOST}} kit")).toBe(
			"## Purpose\n\nHost.\n\nUI  kit\n",
		);
	});
});

describe("writeScaffoldAgentsMarkdown", () => {
	it("writes a composed AGENTS.md when host and shared templates exist", async () => {
		const rootDir = await makeTempDir();
		const templatesRoot = path.join(rootDir, "templates");
		const projectDir = path.join(rootDir, "project");
		await fs.ensureDir(projectDir);
		await fs.outputFile(
			path.join(templatesRoot, "agents", "shared.md"),
			"## UI\n\n{{FIGMA_HOST}}\n",
		);
		await fs.outputFile(
			path.join(templatesRoot, "agents", "hosts", "swa.md"),
			"## Purpose\n\nSWA.\n\n<!-- figma-host -->\nNo host chrome.\n\n<!-- checks-extra -->\n",
		);

		await expect(
			writeScaffoldAgentsMarkdown(projectDir, "swa", templatesRoot),
		).resolves.toBe(true);
		await expect(fs.readFile(path.join(projectDir, "AGENTS.md"), "utf8")).resolves.toBe(
			"## Purpose\n\nSWA.\n\n## UI\n\nNo host chrome.\n",
		);
	});

	it("skips writing when the target has no host overlay", async () => {
		const rootDir = await makeTempDir();
		const templatesRoot = path.join(rootDir, "templates");
		const projectDir = path.join(rootDir, "project");
		await fs.ensureDir(projectDir);
		await fs.outputFile(path.join(templatesRoot, "agents", "shared.md"), "## UI\n");

		await expect(
			writeScaffoldAgentsMarkdown(projectDir, "portal", templatesRoot),
		).resolves.toBe(false);
		await expect(fs.pathExists(path.join(projectDir, "AGENTS.md"))).resolves.toBe(false);
	});

	it("throws when a host overlay exists without the shared core", async () => {
		const rootDir = await makeTempDir();
		const templatesRoot = path.join(rootDir, "templates");
		const projectDir = path.join(rootDir, "project");
		const sharedPath = path.join(templatesRoot, "agents", "shared.md");
		await fs.ensureDir(projectDir);
		await fs.outputFile(
			path.join(templatesRoot, "agents", "hosts", "swa.md"),
			"## Purpose\n",
		);

		await expect(
			writeScaffoldAgentsMarkdown(projectDir, "swa", templatesRoot),
		).rejects.toThrow(`Missing AGENTS.md shared template at ${sharedPath}.`);
	});

	it("composes checked-in host overlays without leftover tokens", async () => {
		const templatesRoot = path.join(import.meta.dirname, "..", "templates");
		const shared = await fs.readFile(
			path.join(templatesRoot, "agents", "shared.md"),
			"utf8",
		);

		for (const target of ["webresource", "swa", "power-pages", "code-apps"]) {
			const host = await fs.readFile(
				path.join(templatesRoot, "agents", "hosts", `${target}.md`),
				"utf8",
			);
			const composed = composeAgentsMarkdown(host, shared);

			expect(composed, target).toContain("## Purpose");
			expect(composed, target).toContain("## UI");
			expect(composed, target).toContain("get_design_context");
			expect(composed, target).not.toContain("{{FIGMA_HOST}}");
			expect(composed, target).not.toContain("{{CHECKS_EXTRA}}");
			expect(composed, target).not.toContain("<!-- figma-host -->");
			expect(composed, target).not.toContain("<!-- checks-extra -->");
		}
	});
});
