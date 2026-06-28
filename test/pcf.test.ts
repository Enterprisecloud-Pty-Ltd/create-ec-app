import os from "node:os";
import path from "node:path";
import fs from "fs-extra";
import { afterEach, describe, expect, it } from "vitest";
import { generatePcfFromExistingWebresource } from "../src/pcf";

const tempDirs: string[] = [];

afterEach(async () => {
	await Promise.all(tempDirs.splice(0).map((dir) => fs.remove(dir)));
});

async function makeTempDir(): Promise<string> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), "create-ec-app-pcf-"));
	tempDirs.push(dir);
	return dir;
}

async function makeBuiltWebresource(): Promise<string> {
	const projectDir = await makeTempDir();
	await fs.outputJson(path.join(projectDir, "package.json"), {
		name: "fusion-notebook",
	});
	await fs.outputFile(
		path.join(projectDir, "src", "App.tsx"),
		"export default function App() { return <div /> }",
	);
	await fs.outputFile(
		path.join(projectDir, "src", "components", "ui", "dialog.tsx"),
		`import * as DialogPrimitive from "@radix-ui/react-dialog"

function DialogContent() {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Content />
    </DialogPrimitive.Portal>
  )
}

export { DialogContent }
`,
	);
	await fs.outputFile(
		path.join(projectDir, "dist", "main.css"),
		":root { --brand: red; }\n.button { color: blue; }\n",
	);

	return projectDir;
}

describe("generatePcfFromExistingWebresource", () => {
	it("generates a token-replaced PCF wrapper with scoped CSS and runtime files", async () => {
		const projectDir = await makeBuiltWebresource();
		await fs.outputFile(
			path.join(projectDir, "pcf-layer", "extra.patch.md"),
			"Generated {{PCF_CONSTRUCTOR}} in {{PCF_NAMESPACE}}",
		);
		const result = await generatePcfFromExistingWebresource({
			pcfDir: projectDir,
			output: "pcf/DemoHost",
			namespace: "ACME",
			controlConstructor: "DemoHost",
			displayName: "Demo Host",
			description: "Demo description",
			version: "2.3.4",
			layers: ["pcf-layer"],
		});

		const outputDir = path.join(projectDir, "pcf", "DemoHost");
		expect(result).toMatchObject({
			constructorName: "DemoHost",
			namespace: "ACME",
			outputDir,
		});
		await expect(
			fs.pathExists(path.join(outputDir, "DemoHost.pcfproj")),
		).resolves.toBe(true);
		await expect(
			fs.pathExists(path.join(outputDir, "ControlHost.pcfproj")),
		).resolves.toBe(false);

		const manifest = await fs.readFile(
			path.join(outputDir, "control", "ControlManifest.Input.xml"),
			"utf8",
		);
		expect(manifest).toContain('namespace="ACME"');
		expect(manifest).toContain('constructor="DemoHost"');
		expect(manifest).toContain('version="2.3.4"');
		expect(manifest).not.toContain("{{PCF_");

		const pcfProject = await fs.readFile(
			path.join(outputDir, "DemoHost.pcfproj"),
			"utf8",
		);
		expect(pcfProject).toContain("<RootNamespace>ACME.DemoHost</RootNamespace>");
		expect(pcfProject).toContain("<Name>DemoHost</Name>");

		const strings = await fs.readFile(
			path.join(outputDir, "strings", "control.1033.resx"),
			"utf8",
		);
		expect(strings).toContain("Demo Host");
		expect(strings).toContain("Demo description");

		const pcfCss = await fs.readFile(path.join(outputDir, "pcf-scoped.css"), "utf8");
		expect(pcfCss).toContain('.pcf-shell-control[data-pcf-control="DemoHost"]');
		expect(pcfCss).toContain(".button");

		await expect(
			fs.pathExists(path.join(projectDir, "src", "runtime", "types.ts")),
		).resolves.toBe(true);
		await expect(
			fs.pathExists(path.join(projectDir, "src", "runtime", "PortalContainer.ts")),
		).resolves.toBe(true);

		const localizedDialog = await fs.readFile(
			path.join(projectDir, "src", "components", "ui", "dialog.tsx"),
			"utf8",
		);
		expect(localizedDialog).toContain("container={portalContainer ?? undefined}");

		await expect(
			fs.readFile(path.join(outputDir, "extra.md"), "utf8"),
		).resolves.toBe("Generated DemoHost in ACME");

		await expect(
			generatePcfFromExistingWebresource({
				pcfDir: projectDir,
				output: "pcf/DemoHost",
				namespace: "ACME",
				controlConstructor: "DemoHost",
			}),
		).resolves.toMatchObject({ outputDir });
	});

	it("derives defaults from package and folder names", async () => {
		const projectDir = await makeBuiltWebresource();
		const result = await generatePcfFromExistingWebresource({
			pcfDir: projectDir,
		});

		expect(result.constructorName).toBe("FusionNotebookHost");
		expect(result.namespace).toBe("EC");
		await expect(
			fs.pathExists(path.join(projectDir, "pcf", "FusionNotebookHost")),
		).resolves.toBe(true);
	});

	it("falls back to the folder name when package.json cannot be read", async () => {
		const projectDir = await makeBuiltWebresource();
		await fs.writeFile(path.join(projectDir, "package.json"), "{bad json", "utf8");

		const result = await generatePcfFromExistingWebresource({
			pcfDir: projectDir,
		});

		expect(result.constructorName).toMatch(/^CreateEcAppPcf[A-Za-z0-9]+Host$/);
	});

	it("supports custom templates without a ControlHost project file", async () => {
		const projectDir = await makeBuiltWebresource();
		const templateDir = path.join(projectDir, "minimal-pcf-template");
		await fs.outputFile(
			path.join(templateDir, "README.patch.md"),
			"{{PCF_CONSTRUCTOR}} {{PCF_PACKAGE_NAME}}",
		);

		await generatePcfFromExistingWebresource({
			pcfDir: projectDir,
			template: templateDir,
			output: "minimal-pcf",
			controlConstructor: "MinimalHost",
			packageName: "minimal-host-package",
		});

		await expect(
			fs.readFile(path.join(projectDir, "minimal-pcf", "README.md"), "utf8"),
		).resolves.toBe("MinimalHost minimal-host-package");
	});

	it("fails clearly when required webresource files are missing", async () => {
		const projectDir = await makeTempDir();
		await fs.outputJson(path.join(projectDir, "package.json"), {
			name: "missing-app",
		});

		await expect(
			generatePcfFromExistingWebresource({ pcfDir: projectDir }),
		).rejects.toThrow("Could not find src/App.tsx");

		await fs.outputFile(
			path.join(projectDir, "src", "App.tsx"),
			"export default function App() { return null }",
		);

		await expect(
			generatePcfFromExistingWebresource({ pcfDir: projectDir }),
		).rejects.toThrow("Run the webresource build first");
	});
});
