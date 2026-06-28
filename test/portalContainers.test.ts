import os from "node:os";
import path from "node:path";
import fs from "fs-extra";
import { afterEach, describe, expect, it } from "vitest";
import { localizeShadcnPortals } from "../src/portalContainers";

const repoRoot = path.resolve(import.meta.dirname, "..");
const fixtureDir = path.join(repoRoot, "test", "fixtures", "shadcn");
const tempDirs: string[] = [];

afterEach(async () => {
	await Promise.all(tempDirs.splice(0).map((dir) => fs.remove(dir)));
});

async function makeProjectWithFixtures(): Promise<string> {
	const projectDir = await fs.mkdtemp(
		path.join(os.tmpdir(), "create-ec-app-shadcn-"),
	);
	tempDirs.push(projectDir);

	const uiDir = path.join(projectDir, "src", "components", "ui");
	await fs.ensureDir(uiDir);

	for (const fileName of [
		"dialog.tsx",
		"dropdown-menu.tsx",
		"popover.tsx",
		"no-portal.tsx",
	]) {
		await fs.copy(path.join(fixtureDir, fileName), path.join(uiDir, fileName));
	}

	return projectDir;
}

describe("localizeShadcnPortals", () => {
	it("adds portal container props, imports, hooks, and runtime file", async () => {
		const projectDir = await makeProjectWithFixtures();

		await localizeShadcnPortals(projectDir);

		for (const fileName of ["dialog.tsx", "dropdown-menu.tsx", "popover.tsx"]) {
			const source = await fs.readFile(
				path.join(projectDir, "src", "components", "ui", fileName),
				"utf8",
			);

			expect(source).toContain(
				'import { usePortalContainer } from "@/runtime/PortalContainer"',
			);
			expect(source).toContain("const portalContainer = usePortalContainer()");
			expect(source).toContain("container={portalContainer ?? undefined}");
		}

		await expect(
			fs.pathExists(path.join(projectDir, "src", "runtime", "PortalContainer.ts")),
		).resolves.toBe(true);
	});

	it("leaves files without portals unchanged", async () => {
		const projectDir = await makeProjectWithFixtures();
		const filePath = path.join(
			projectDir,
			"src",
			"components",
			"ui",
			"no-portal.tsx",
		);
		const original = await fs.readFile(filePath, "utf8");

		await localizeShadcnPortals(projectDir);

		await expect(fs.readFile(filePath, "utf8")).resolves.toBe(original);
	});
});
