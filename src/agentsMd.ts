import path from "node:path";
import fs from "fs-extra";

export const AGENTS_FIGMA_HOST_MARKER = "<!-- figma-host -->";
export const AGENTS_CHECKS_EXTRA_MARKER = "<!-- checks-extra -->";
export const AGENTS_FIGMA_HOST_TOKEN = "{{FIGMA_HOST}}";
export const AGENTS_CHECKS_EXTRA_TOKEN = "{{CHECKS_EXTRA}}";

export interface AgentsHostOverlay {
	body: string;
	figmaHost: string;
	checksExtra: string;
}

/**
 * Splits a target AGENTS overlay into the host body plus optional Figma/check inserts.
 */
export function parseAgentsHostOverlay(content: string): AgentsHostOverlay {
	const figmaIndex = content.indexOf(AGENTS_FIGMA_HOST_MARKER);
	const checksIndex = content.indexOf(AGENTS_CHECKS_EXTRA_MARKER);

	if (figmaIndex === -1 && checksIndex === -1) {
		return { body: content.trim(), figmaHost: "", checksExtra: "" };
	}

	if (figmaIndex === -1) {
		return {
			body: content.slice(0, checksIndex).trim(),
			figmaHost: "",
			checksExtra: content
				.slice(checksIndex + AGENTS_CHECKS_EXTRA_MARKER.length)
				.trim(),
		};
	}

	if (checksIndex === -1) {
		return {
			body: content.slice(0, figmaIndex).trim(),
			figmaHost: content
				.slice(figmaIndex + AGENTS_FIGMA_HOST_MARKER.length)
				.trim(),
			checksExtra: "",
		};
	}

	if (figmaIndex < checksIndex) {
		return {
			body: content.slice(0, figmaIndex).trim(),
			figmaHost: content
				.slice(
					figmaIndex + AGENTS_FIGMA_HOST_MARKER.length,
					checksIndex,
				)
				.trim(),
			checksExtra: content
				.slice(checksIndex + AGENTS_CHECKS_EXTRA_MARKER.length)
				.trim(),
		};
	}

	return {
		body: content.slice(0, checksIndex).trim(),
		checksExtra: content
			.slice(checksIndex + AGENTS_CHECKS_EXTRA_MARKER.length, figmaIndex)
			.trim(),
		figmaHost: content
			.slice(figmaIndex + AGENTS_FIGMA_HOST_MARKER.length)
			.trim(),
	};
}

/**
 * Builds the generated root AGENTS.md from a host overlay and the shared core.
 */
export function composeAgentsMarkdown(host: string, shared: string): string {
	const overlay = parseAgentsHostOverlay(host);
	const withFigma =
		overlay.figmaHost === ""
			? shared
					.replaceAll(`\n${AGENTS_FIGMA_HOST_TOKEN}\n`, "\n")
					.replaceAll(AGENTS_FIGMA_HOST_TOKEN, "")
			: shared.replaceAll(AGENTS_FIGMA_HOST_TOKEN, overlay.figmaHost);
	const checksExtra =
		overlay.checksExtra === "" ? "" : `${overlay.checksExtra}\n`;
	const next = withFigma.replaceAll(AGENTS_CHECKS_EXTRA_TOKEN, checksExtra);

	return `${overlay.body}\n\n${next.trim()}\n`;
}

/**
 * Writes a composed AGENTS.md when a host overlay exists for the scaffold target.
 *
 * @returns `true` when a file was written.
 */
export async function writeScaffoldAgentsMarkdown(
	projectDir: string,
	target: string,
	templatesRoot: string,
): Promise<boolean> {
	const hostPath = path.join(templatesRoot, "agents", "hosts", `${target}.md`);
	if (!(await fs.pathExists(hostPath))) {
		return false;
	}

	const sharedPath = path.join(templatesRoot, "agents", "shared.md");
	if (!(await fs.pathExists(sharedPath))) {
		throw new Error(`Missing AGENTS.md shared template at ${sharedPath}.`);
	}

	const [host, shared] = await Promise.all([
		fs.readFile(hostPath, "utf8"),
		fs.readFile(sharedPath, "utf8"),
	]);

	await fs.writeFile(
		path.join(projectDir, "AGENTS.md"),
		composeAgentsMarkdown(host, shared),
		"utf8",
	);
	return true;
}
