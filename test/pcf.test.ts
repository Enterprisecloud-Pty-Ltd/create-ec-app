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

async function makeBuiltWebresource(directory?: string): Promise<string> {
	const projectDir = directory ?? (await makeTempDir());
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
		expect(
			(await fs.readJson(path.join(outputDir, "package.json"))).devDependencies["@types/xrm"],
		).toBe("^9.0.97");
		await expect(
			fs.readJson(path.join(outputDir, "create-ec-app.pcf.json")),
		).resolves.toEqual({
			generatedBy: "create-ec-app",
			kind: "pcf-wrapper",
		});
		await expect(
			fs.readFile(path.join(outputDir, "AGENTS.md"), "utf8"),
		).resolves.toContain(
			'.pcf-shell-control[data-pcf-control="DemoHost"]',
		);
		await expect(
			fs.readFile(path.join(outputDir, "CLAUDE.md"), "utf8"),
		).resolves.toBe("@AGENTS.md\n");

		const manifest = await fs.readFile(
			path.join(outputDir, "control", "ControlManifest.Input.xml"),
			"utf8",
		);
		expect(manifest).toContain('namespace="ACME"');
		expect(manifest).toContain('constructor="DemoHost"');
		expect(manifest).toContain('version="2.3.4"');
		expect(manifest).not.toContain("{{PCF_");
		const controlSource = await fs.readFile(
			path.join(outputDir, "index.ts"),
			"utf8",
		);
		expect(controlSource).toContain("public getOutputs(): IOutputs");
		expect(controlSource).toContain("return {};");
		expect(controlSource).not.toContain("hostField: this.runtime.recordId");

		const pcfProject = await fs.readFile(
			path.join(outputDir, "DemoHost.pcfproj"),
			"utf8",
		);
		expect(pcfProject).toContain("<RootNamespace>ACME.DemoHost</RootNamespace>");
		expect(pcfProject).toContain("<Name>DemoHost</Name>");
		await expect(
			fs.readFile(path.join(outputDir, "runtime", "pcfAuthService.ts"), "utf8"),
		).resolves.toContain("Webresource authentication is unavailable in the PCF host");
		await expect(
			fs.readFile(path.join(outputDir, "webpack.config.js"), "utf8"),
		).resolves.toContain("runtime/pcfAuthService.ts");

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
			fs.readFile(path.join(projectDir, "src", "runtime", "types.ts"), "utf8"),
		).resolves.toContain("entityType: string");
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

	it("keeps Kendo popups inside the scoped PCF portal root", async () => {
		const projectDir = await makeBuiltWebresource();
		await fs.writeJson(path.join(projectDir, "package.json"), {
			name: "kendo-app",
			dependencies: {
				"@progress/kendo-react-popup": "^15.1.0",
			},
		});

		const result = await generatePcfFromExistingWebresource({
			pcfDir: projectDir,
		});
		const shell = await fs.readFile(
			path.join(result.outputDir, "runtime", "PcfAppShell.tsx"),
			"utf8",
		);

		expect(shell).toContain(
			'import { PopupPropsContext } from "@progress/kendo-react-popup";',
		);
		expect(shell).toContain("<PopupPropsContext.Provider");
		expect(shell).toContain("appendTo: portalContainer");
		const webpackConfig = await fs.readFile(
			path.join(result.outputDir, "webpack.config.js"),
			"utf8",
		);
		expect(webpackConfig).toContain('"@progress/kendo-react-popup"');
		expect(webpackConfig).toContain(
			'"../node_modules/@progress/kendo-react-popup"',
		);
		const tsconfig = await fs.readFile(
			path.join(result.outputDir, "tsconfig.json"),
			"utf8",
		);
		expect(tsconfig).toContain('"@progress/kendo-react-popup"');
	});

	it("omits Kendo popup integration when the source app does not use it", async () => {
		const projectDir = await makeBuiltWebresource();
		const result = await generatePcfFromExistingWebresource({
			pcfDir: projectDir,
		});
		const shell = await fs.readFile(
			path.join(result.outputDir, "runtime", "PcfAppShell.tsx"),
			"utf8",
		);

		expect(shell).not.toContain("PopupPropsContext");
		expect(shell).not.toContain("{{PCF_KENDO");
	});

	it("derives a valid constructor from a package name starting with digits", async () => {
		const projectDir = await makeBuiltWebresource();
		await fs.writeJson(path.join(projectDir, "package.json"), { name: "360-dashboard" });

		const result = await generatePcfFromExistingWebresource({
			pcfDir: projectDir,
			namespace: "EC.Controls2",
			version: "0.0.1",
		});

		expect(result.constructorName).toBe("App360DashboardHost");
		const manifest = await fs.readFile(
			path.join(result.outputDir, "control", "ControlManifest.Input.xml"), "utf8",
		);
		expect(manifest).toContain('constructor="App360DashboardHost"');
		expect(manifest).toContain('namespace="EC.Controls2"');
		expect(manifest).toContain('version="0.0.1"');
		await expect(
			fs.pathExists(path.join(result.outputDir, "App360DashboardHost.pcfproj")),
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

	it("refuses to overwrite a non-empty output directory that is not a generated control", async () => {
		const projectDir = await makeBuiltWebresource();
		const outputDir = path.join(projectDir, "pcf", "Existing");
		await fs.outputFile(path.join(outputDir, "keep.txt"), "do not overwrite");

		await expect(
			generatePcfFromExistingWebresource({
				pcfDir: projectDir,
				output: "pcf/Existing",
				controlConstructor: "ExistingHost",
			}),
		).rejects.toThrow("Use --force to overwrite it.");

		await expect(
			fs.readFile(path.join(outputDir, "keep.txt"), "utf8"),
		).resolves.toBe("do not overwrite");
	});

	it("does not treat a standard PCF manifest as generator ownership", async () => {
		const projectDir = await makeBuiltWebresource();
		const outputDir = path.join(projectDir, "pcf", "HandMaintained");
		await fs.outputFile(
			path.join(outputDir, "control", "ControlManifest.Input.xml"),
			"<manifest />",
		);
		await fs.outputFile(path.join(outputDir, "index.ts"), "keep hand-written code");

		await expect(
			generatePcfFromExistingWebresource({
				pcfDir: projectDir,
				output: "pcf/HandMaintained",
				controlConstructor: "HandMaintainedHost",
			}),
		).rejects.toThrow("Use --force to overwrite it.");

		await expect(fs.readFile(path.join(outputDir, "index.ts"), "utf8")).resolves.toBe(
			"keep hand-written code",
		);
	});

	it("preflights missing layers before mutating source or generated output", async () => {
		const projectDir = await makeBuiltWebresource();
		const first = await generatePcfFromExistingWebresource({
			pcfDir: projectDir,
			controlConstructor: "LayeredHost",
		});
		const appPath = path.join(projectDir, "src", "App.tsx");
		const appBefore = await fs.readFile(appPath, "utf8");
		const outputSentinel = path.join(first.outputDir, "keep.txt");
		await fs.writeFile(outputSentinel, "keep generated output");

		await expect(
			generatePcfFromExistingWebresource({
				pcfDir: projectDir,
				controlConstructor: "LayeredHost",
				layers: ["missing-layer"],
			}),
		).rejects.toThrow("PCF layer directory is not readable");

		await expect(fs.readFile(appPath, "utf8")).resolves.toBe(appBefore);
		await expect(fs.readFile(outputSentinel, "utf8")).resolves.toBe(
			"keep generated output",
		);
	});

	it("rejects a layer inside the output before deleting it", async () => {
		const projectDir = await makeBuiltWebresource();
		const first = await generatePcfFromExistingWebresource({
			pcfDir: projectDir,
			controlConstructor: "ContainedLayerHost",
		});
		const containedLayer = path.join(first.outputDir, "custom-layer");
		await fs.outputFile(path.join(containedLayer, "README.md"), "layer contents");

		await expect(
			generatePcfFromExistingWebresource({
				pcfDir: projectDir,
				controlConstructor: "ContainedLayerHost",
				layers: [containedLayer],
			}),
		).rejects.toThrow("PCF layer directory cannot overlap the PCF output directory");

		await expect(
			fs.readFile(path.join(containedLayer, "README.md"), "utf8"),
		).resolves.toBe("layer contents");
	});

	it("rejects a layer that contains the output before mutating either directory", async () => {
		const projectDir = await makeBuiltWebresource();
		const appBefore = await fs.readFile(path.join(projectDir, "src", "App.tsx"), "utf8");

		await expect(
			generatePcfFromExistingWebresource({
				pcfDir: projectDir,
				controlConstructor: "AncestorLayerHost",
				layers: ["."],
			}),
		).rejects.toThrow("PCF layer directory cannot overlap the PCF output directory");

		await expect(fs.readFile(path.join(projectDir, "src", "App.tsx"), "utf8"))
			.resolves.toBe(appBefore);
		await expect(
			fs.pathExists(path.join(projectDir, "pcf", "AncestorLayerHost")),
		).resolves.toBe(false);
	});

	it("rejects a template file before mutating source or generated output", async () => {
		const projectDir = await makeBuiltWebresource();
		const first = await generatePcfFromExistingWebresource({
			pcfDir: projectDir,
			controlConstructor: "TemplateFileHost",
		});
		const templateFile = path.join(projectDir, "not-a-template.txt");
		await fs.writeFile(templateFile, "not a directory");
		const appPath = path.join(projectDir, "src", "App.tsx");
		const appBefore = await fs.readFile(appPath, "utf8");
		const outputSentinel = path.join(first.outputDir, "keep.txt");
		await fs.writeFile(outputSentinel, "keep generated output");

		await expect(
			generatePcfFromExistingWebresource({
				pcfDir: projectDir,
				controlConstructor: "TemplateFileHost",
				template: templateFile,
			}),
		).rejects.toThrow("PCF template path is not a directory");

		await expect(fs.readFile(appPath, "utf8")).resolves.toBe(appBefore);
		await expect(fs.readFile(outputSentinel, "utf8")).resolves.toBe(
			"keep generated output",
		);
	});

	it.skipIf(process.platform === "win32")(
		"rejects an unreadable layer before mutating source or generated output",
		async () => {
			const projectDir = await makeBuiltWebresource();
			const first = await generatePcfFromExistingWebresource({
				pcfDir: projectDir,
				controlConstructor: "UnreadableLayerHost",
			});
			const layerDir = path.join(projectDir, "unreadable-layer");
			await fs.ensureDir(layerDir);
			const appPath = path.join(projectDir, "src", "App.tsx");
			const appBefore = await fs.readFile(appPath, "utf8");
			const outputSentinel = path.join(first.outputDir, "keep.txt");
			await fs.writeFile(outputSentinel, "keep generated output");
			await fs.chmod(layerDir, 0o000);
			try {
				await expect(
					generatePcfFromExistingWebresource({
						pcfDir: projectDir,
						controlConstructor: "UnreadableLayerHost",
						layers: [layerDir],
					}),
				).rejects.toThrow("PCF layer directory is not readable");
			} finally {
				await fs.chmod(layerDir, 0o755);
			}

			await expect(fs.readFile(appPath, "utf8")).resolves.toBe(appBefore);
			await expect(fs.readFile(outputSentinel, "utf8")).resolves.toBe(
				"keep generated output",
			);
		},
	);

	it("overwrites a foreign output directory only when forced", async () => {
		const projectDir = await makeBuiltWebresource();
		const outputDir = path.join(projectDir, "pcf", "Forced");
		await fs.outputFile(path.join(outputDir, "keep.txt"), "do not overwrite");

		await generatePcfFromExistingWebresource({
			pcfDir: projectDir,
			output: "pcf/Forced",
			controlConstructor: "ForcedHost",
			force: true,
		});

		await expect(fs.pathExists(path.join(outputDir, "keep.txt"))).resolves.toBe(
			false,
		);
		await expect(
			fs.pathExists(path.join(outputDir, "ForcedHost.pcfproj")),
		).resolves.toBe(true);
	});

	it("reuses an empty output directory without forcing", async () => {
		const projectDir = await makeBuiltWebresource();
		const outputDir = path.join(projectDir, "pcf", "Empty");
		await fs.ensureDir(outputDir);

		await generatePcfFromExistingWebresource({
			pcfDir: projectDir,
			output: "pcf/Empty",
			controlConstructor: "EmptyHost",
		});

		await expect(
			fs.pathExists(path.join(outputDir, "EmptyHost.pcfproj")),
		).resolves.toBe(true);
	});

	it("rejects using the project root as the PCF output directory", async () => {
		const projectDir = await makeBuiltWebresource();

		await expect(
			generatePcfFromExistingWebresource({
				pcfDir: projectDir,
				output: ".",
				controlConstructor: "RootHost",
			}),
		).rejects.toThrow("cannot be the webresource project root");

		await expect(fs.pathExists(path.join(projectDir, "src", "App.tsx"))).resolves.toBe(
			true,
		);
	});

	it("rejects output directories that contain the project even when forced", async () => {
		const projectDir = await makeBuiltWebresource();

		await expect(
			generatePcfFromExistingWebresource({
				pcfDir: projectDir,
				output: "..",
				controlConstructor: "ParentHost",
				force: true,
			}),
		).rejects.toThrow("a directory that contains it");

		await expect(fs.pathExists(path.join(projectDir, "src", "App.tsx"))).resolves.toBe(
			true,
		);
	});

	it.each(["src", "src/generated", "dist", "dist/control"])(
		"rejects the source-owned output path %s even when forced",
		async (output) => {
			const projectDir = await makeBuiltWebresource();
			const appPath = path.join(projectDir, "src", "App.tsx");
			const appBefore = await fs.readFile(appPath, "utf8");

			await expect(
				generatePcfFromExistingWebresource({
					pcfDir: projectDir,
					output,
					controlConstructor: "UnsafeOutputHost",
					force: true,
				}),
			).rejects.toThrow("PCF output directory cannot be");

			await expect(fs.readFile(appPath, "utf8")).resolves.toBe(appBefore);
		},
	);

	it("rejects an output alias that resolves into the source tree", async () => {
		const projectDir = await makeBuiltWebresource();
		const outputAlias = path.join(projectDir, "pcf", "source-alias");
		await fs.ensureDir(path.dirname(outputAlias));
		await fs.symlink(path.join(projectDir, "src"), outputAlias, "junction");
		const appPath = path.join(projectDir, "src", "App.tsx");
		const appBefore = await fs.readFile(appPath, "utf8");

		await expect(
			generatePcfFromExistingWebresource({
				pcfDir: projectDir,
				output: outputAlias,
				controlConstructor: "AliasedOutputHost",
				force: true,
			}),
		).rejects.toThrow("PCF output directory cannot be src");

		await expect(fs.readFile(appPath, "utf8")).resolves.toBe(appBefore);
	});

	it.each(["source", "output", "ancestor"])(
		"preserves the source when a %s alias bypasses lexical output checks",
		async (aliasKind) => {
			const rootDir = await makeTempDir();
			const parentDir = path.join(rootDir, "real");
			const projectDir = await makeBuiltWebresource(path.join(parentDir, "..demo"));
			const aliasDir = path.join(rootDir, "alias");
			await fs.symlink(parentDir, aliasDir, "junction");
			const aliasedProject = path.join(aliasDir, "..demo");
			const outputDir = aliasKind === "ancestor"
				? aliasDir
				: aliasKind === "output" ? aliasedProject : projectDir;
			const appBefore = await fs.readFile(path.join(projectDir, "src", "App.tsx"), "utf8");
			const dialogBefore = await fs.readFile(
				path.join(projectDir, "src", "components", "ui", "dialog.tsx"), "utf8",
			);

			await expect(generatePcfFromExistingWebresource({
				pcfDir: aliasKind === "source" ? aliasedProject : projectDir,
				output: outputDir,
				force: true,
			})).rejects.toThrow("cannot be the webresource project root or a directory that contains it");

			await expect(fs.readFile(path.join(projectDir, "src", "App.tsx"), "utf8"))
				.resolves.toBe(appBefore);
			await expect(fs.readFile(path.join(projectDir, "src", "components", "ui", "dialog.tsx"), "utf8"))
				.resolves.toBe(dialogBefore);
			await expect(fs.pathExists(path.join(projectDir, "src", "runtime"))).resolves.toBe(false);
		},
	);

	it.each([
		{ options: { controlConstructor: "Demo_Host" }, field: "constructor name" },
		{ options: { controlConstructor: "_Demo" }, field: "constructor name" },
		{ options: { controlConstructor: "360Host" }, field: "constructor name" },
		{ options: { namespace: "EC_Controls" }, field: "namespace" },
		{ options: { namespace: "EC.Controls_2" }, field: "namespace" },
		{ options: { version: "1.0.0-beta.1" }, field: "version" },
		{ options: { version: "1.0.0+build.1" }, field: "version" },
		{ options: { version: "01.0.0" }, field: "version" },
	])("rejects unsupported $options before mutating source or output", async ({ options, field }) => {
		const projectDir = await makeBuiltWebresource();
		const outputDir = path.join(projectDir, "pcf", "Existing");
		await fs.outputFile(path.join(outputDir, "keep.txt"), "keep existing output");

		await expect(generatePcfFromExistingWebresource({
			pcfDir: projectDir,
			output: outputDir,
			force: true,
			...options,
		})).rejects.toThrow(`Invalid PCF ${field}`);

		await expect(fs.readFile(path.join(outputDir, "keep.txt"), "utf8"))
			.resolves.toBe("keep existing output");
		await expect(fs.pathExists(path.join(projectDir, "src", "runtime"))).resolves.toBe(false);
	});

	it("rejects values that would corrupt generated XML and JSON", async () => {
		const projectDir = await makeBuiltWebresource();

		await expect(
			generatePcfFromExistingWebresource({
				pcfDir: projectDir,
				controlConstructor: "Bad-Name",
			}),
		).rejects.toThrow('Invalid PCF constructor name "Bad-Name"');
		await expect(
			generatePcfFromExistingWebresource({
				pcfDir: projectDir,
				namespace: "9bad",
			}),
		).rejects.toThrow('Invalid PCF namespace "9bad"');
		await expect(
			generatePcfFromExistingWebresource({
				pcfDir: projectDir,
				version: "next",
			}),
		).rejects.toThrow('Invalid PCF version "next"');
		await expect(
			generatePcfFromExistingWebresource({
				pcfDir: projectDir,
				packageName: "Bad Name",
			}),
		).rejects.toThrow('Invalid PCF package name "Bad Name"');
		await expect(
			generatePcfFromExistingWebresource({
				pcfDir: projectDir,
				displayName: 'Demo "quoted"',
			}),
		).rejects.toThrow("Invalid PCF display name");
		await expect(
			generatePcfFromExistingWebresource({
				pcfDir: projectDir,
				description: "Renders <App />",
			}),
		).rejects.toThrow("Invalid PCF description");
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
