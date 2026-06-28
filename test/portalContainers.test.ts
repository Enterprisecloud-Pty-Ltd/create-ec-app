import os from "node:os";
import path from "node:path";
import fs from "fs-extra";
import { afterEach, describe, expect, it } from "vitest";
import {
	ensurePortalContainerRuntime,
	localizeShadcnPortals,
} from "../src/portalContainers";

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
		await fs.outputFile(
			path.join(projectDir, "src", "components", "ui", "notes.md"),
			"# ignored",
		);

		await localizeShadcnPortals(projectDir);
		const firstRunSources = new Map<string, string>();
		for (const fileName of ["dialog.tsx", "dropdown-menu.tsx", "popover.tsx"]) {
			firstRunSources.set(
				fileName,
				await fs.readFile(
					path.join(projectDir, "src", "components", "ui", fileName),
					"utf8",
				),
			);
		}
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
			expect(source).toBe(firstRunSources.get(fileName));
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

	it("returns without creating runtime files when no UI component folder exists", async () => {
		const projectDir = await fs.mkdtemp(
			path.join(os.tmpdir(), "create-ec-app-empty-"),
		);
		tempDirs.push(projectDir);

		await localizeShadcnPortals(projectDir);

		await expect(
			fs.pathExists(path.join(projectDir, "src", "runtime", "PortalContainer.ts")),
		).resolves.toBe(false);
	});

	it("does not overwrite an existing portal runtime file", async () => {
		const projectDir = await makeProjectWithFixtures();
		const runtimePath = path.join(
			projectDir,
			"src",
			"runtime",
			"PortalContainer.ts",
		);
		await fs.outputFile(runtimePath, "export const existing = true;\n");

		await ensurePortalContainerRuntime(projectDir);

		await expect(fs.readFile(runtimePath, "utf8")).resolves.toBe(
			"export const existing = true;\n",
		);
	});

	it("migrates legacy EC portal runtime imports", async () => {
		const projectDir = await fs.mkdtemp(
			path.join(os.tmpdir(), "create-ec-app-legacy-"),
		);
		tempDirs.push(projectDir);
		const filePath = path.join(
			projectDir,
			"src",
			"components",
			"ui",
			"dialog.tsx",
		);
		await fs.outputFile(
			filePath,
			`import { useEcPortalContainer } from "@/runtime/EcPortalContainer"
import * as DialogPrimitive from "@radix-ui/react-dialog"

function DialogContent() {
  const legacy = useEcPortalContainer()
  return <DialogPrimitive.Portal>{legacy ? null : null}</DialogPrimitive.Portal>
}
`,
		);

		await localizeShadcnPortals(projectDir);

		const source = await fs.readFile(filePath, "utf8");
		expect(source).toContain('from "@/runtime/PortalContainer"');
		expect(source).toContain("usePortalContainer()");
		expect(source).not.toContain("useEcPortalContainer");
		expect(source).not.toContain("EcPortalContainer");
	});

	it("adds portal runtime imports at the top when a file has no imports", async () => {
		const projectDir = await fs.mkdtemp(
			path.join(os.tmpdir(), "create-ec-app-no-imports-"),
		);
		tempDirs.push(projectDir);
		const filePath = path.join(
			projectDir,
			"src",
			"components",
			"ui",
			"portal.tsx",
		);
		await fs.outputFile(
			filePath,
			`function PortalOnly() {
  return <DialogPrimitive.Portal />
}
`,
		);

		await localizeShadcnPortals(projectDir);

		const source = await fs.readFile(filePath, "utf8");
		expect(source.startsWith('import { usePortalContainer } from "@/runtime/PortalContainer"')).toBe(
			true,
		);
		expect(source).toContain("container={portalContainer ?? undefined}");
	});

	it("does not duplicate an existing portal container hook", async () => {
		const projectDir = await fs.mkdtemp(
			path.join(os.tmpdir(), "create-ec-app-existing-hook-"),
		);
		tempDirs.push(projectDir);
		const filePath = path.join(
			projectDir,
			"src",
			"components",
			"ui",
			"dialog.tsx",
		);
		await fs.outputFile(
			filePath,
			`import { usePortalContainer } from "@/runtime/PortalContainer"
import * as DialogPrimitive from "@radix-ui/react-dialog"

function DialogContent() {
  const portalContainer = usePortalContainer()
  return <DialogPrimitive.Portal />
}
`,
		);

		await localizeShadcnPortals(projectDir);

		const source = await fs.readFile(filePath, "utf8");
		expect(source.match(/const portalContainer = usePortalContainer\(\)/g)).toHaveLength(
			1,
		);
		expect(source).toContain("container={portalContainer ?? undefined}");
	});

	it("applies generated shadcn compatibility changes unless disabled", async () => {
		const projectDir = await fs.mkdtemp(
			path.join(os.tmpdir(), "create-ec-app-compat-"),
		);
		tempDirs.push(projectDir);
		const filePath = path.join(
			projectDir,
			"src",
			"components",
			"ui",
			"calendar.tsx",
		);
		await fs.outputFile(
			filePath,
			`import { DayPicker } from "react-day-picker"

function Calendar() {
  return (
    <DayPicker
      className="ec:"
      classNames={{
        table: "w-full",
      }}
    />
  )
}
`,
		);

		await localizeShadcnPortals(projectDir);

		const updated = await fs.readFile(filePath, "utf8");
		expect(updated).toContain('className=""');
		expect(updated).toContain("month_grid:");

		await fs.writeFile(
			filePath,
			`import { DayPicker } from "react-day-picker"

function Calendar() {
  return (
    <DayPicker
      classNames={{
        table: "w-full",
      }}
    />
  )
}
`,
		);
		await localizeShadcnPortals(projectDir, {
			includeGeneratedCompatibility: false,
		});

		await expect(fs.readFile(filePath, "utf8")).resolves.toContain("table:");
	});

	it("throws an actionable error when a portal is outside a function body", async () => {
		const projectDir = await fs.mkdtemp(
			path.join(os.tmpdir(), "create-ec-app-error-"),
		);
		tempDirs.push(projectDir);
		const filePath = path.join(
			projectDir,
			"src",
			"components",
			"ui",
			"bad.tsx",
		);
		await fs.outputFile(
			filePath,
			`import * as DialogPrimitive from "@radix-ui/react-dialog"

const badPortal = <DialogPrimitive.Portal />
`,
		);

		await expect(localizeShadcnPortals(projectDir)).rejects.toThrow(
			`Could not locate a function body for a shadcn Portal in ${filePath}:3.`,
		);
	});
});
