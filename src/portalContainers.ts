import path from "node:path";
import fs from "fs-extra";

const PORTAL_CONTAINER_TEMPLATE = `import * as React from "react";

export const PortalContainerContext =
\tReact.createContext<HTMLElement | null>(null);

export function usePortalContainer() {
\treturn React.useContext(PortalContainerContext);
}
`;

export async function ensurePortalContainerRuntime(
	projectDir: string,
): Promise<void> {
	const portalContainerPath = path.join(
		projectDir,
		"src",
		"runtime",
		"PortalContainer.ts",
	);

	if (await fs.pathExists(portalContainerPath)) {
		return;
	}

	await fs.ensureDir(path.dirname(portalContainerPath));
	await fs.writeFile(portalContainerPath, PORTAL_CONTAINER_TEMPLATE, "utf8");
}

interface LocalizeShadcnPortalsOptions {
	includeGeneratedCompatibility?: boolean;
}

export async function localizeShadcnPortals(
	projectDir: string,
	options: LocalizeShadcnPortalsOptions = {},
): Promise<void> {
	const componentsDir = path.join(projectDir, "src", "components", "ui");
	if (!(await fs.pathExists(componentsDir))) {
		return;
	}

	await ensurePortalContainerRuntime(projectDir);

	const entries = await fs.readdir(componentsDir, { withFileTypes: true });

	for (const entry of entries) {
		if (!entry.isFile() || !entry.name.endsWith(".tsx")) {
			continue;
		}

		const filePath = path.join(componentsDir, entry.name);
		const source = await fs.readFile(filePath, "utf8");
		const withPortalContainers = withPortalRuntime(source, filePath);
		const updated =
			options.includeGeneratedCompatibility === false
				? withPortalContainers
				: withGeneratedShadcnCompatibility(withPortalContainers);

		if (updated !== source) {
			await fs.writeFile(filePath, updated, "utf8");
		}
	}
}

function withPortalRuntime(source: string, filePath: string): string {
	const migratedSource = source.replace(
		/from ["']@\/runtime\/EcAppShell["']/g,
		'from "@/runtime/PortalContainer"',
	);
	const withGenericPortalRuntime = migratedSource
		.replace(
			/from ["']@\/runtime\/EcPortalContainer["']/g,
			'from "@/runtime/PortalContainer"',
		)
		.replace(/\buseEcPortalContainer\b/g, "usePortalContainer");
	const withPortalContainers = withGenericPortalRuntime.replace(
		/<([A-Za-z][A-Za-z0-9]*Primitive)\.Portal\b(?![^>]*\bcontainer=)/g,
		"<$1.Portal container={portalContainer ?? undefined}",
	);

	if (withPortalContainers === withGenericPortalRuntime) {
		return withGenericPortalRuntime;
	}

	return addPortalImport(
		addPortalHookDeclarations(withPortalContainers, filePath),
	);
}

function withGeneratedShadcnCompatibility(source: string): string {
	const withChartAttributeSelectors = removeStandaloneClassPrefixes(source)
		.replace(/\[stroke=#ccc\]/g, "[stroke='#ccc']")
		.replace(/\[stroke=#fff\]/g, "[stroke='#fff']");

	if (!withChartAttributeSelectors.includes('from "react-day-picker"')) {
		return withChartAttributeSelectors;
	}

	return withChartAttributeSelectors.replace(/(\n\s*)table:/g, "$1month_grid:");
}

function removeStandaloneClassPrefixes(source: string): string {
	let updated = source;
	let previous: string;

	do {
		previous = updated;
		updated = updated.replace(/(^|[\s"'])ec:(?=\s|["'])/g, "$1");
	} while (updated !== previous);

	return updated;
}

function addPortalImport(source: string): string {
	if (source.includes('from "@/runtime/PortalContainer"')) {
		return source;
	}

	const importPattern =
		/import[\s\S]*?from\s+["'][^"']+["'];?\n|import\s+["'][^"']+["'];?\n/g;
	let insertAt = 0;
	for (const match of source.matchAll(importPattern)) {
		insertAt = (match.index ?? 0) + match[0].length;
	}

	const importLine =
		'import { usePortalContainer } from "@/runtime/PortalContainer"\n';

	return `${source.slice(0, insertAt)}${importLine}${source.slice(insertAt)}`;
}

function addPortalHookDeclarations(source: string, filePath: string): string {
	const lines = source.split("\n");
	const hookBodyLines = new Set<number>();

	for (let index = 0; index < lines.length; index += 1) {
		if (!lines[index]?.includes("container={portalContainer ?? undefined}")) {
			continue;
		}

		const bodyLine = findContainingFunctionBodyLine(lines, index);
		if (bodyLine === undefined) {
			throw new Error(
				`Could not locate a function body for a shadcn Portal in ${filePath}.`,
			);
		}

		hookBodyLines.add(bodyLine);
	}

	for (const bodyLine of [...hookBodyLines].sort((a, b) => b - a)) {
		if (lines[bodyLine + 1]?.includes("const portalContainer")) {
			continue;
		}

		const indent = lines[bodyLine]?.match(/^(\s*)/)?.[1] ?? "";
		lines.splice(
			bodyLine + 1,
			0,
			`${indent}  const portalContainer = usePortalContainer()`,
		);
	}

	return lines.join("\n");
}

function findContainingFunctionBodyLine(
	lines: string[],
	portalLine: number,
): number | undefined {
	for (let index = portalLine; index >= 0; index -= 1) {
		if (!/^\s*function\s+\w+/.test(lines[index] ?? "")) {
			continue;
		}

		for (let bodyLine = index; bodyLine <= portalLine; bodyLine += 1) {
			if (/\)\s*\{\s*$/.test(lines[bodyLine] ?? "")) {
				return bodyLine;
			}
		}
	}

	return undefined;
}
