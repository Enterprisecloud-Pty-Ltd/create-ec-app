import path from "node:path";
import fs from "fs-extra";

/**
 * Applies a template later onto an existing base project
 * @param { string } layerDir - the base directory of the layer to patch
 * @param { string } projectDir - the base directory of the files to be patched
 * */
export async function applyLayer(layerDir: string, projectDir: string) {
	const entries = await fs.readdir(layerDir, { withFileTypes: true });

	for (const entry of entries) {
		const layerPath = path.join(layerDir, entry.name);
		const relPath = path.relative(layerDir, layerPath);

		if (entry.isDirectory()) {
			await applyLayer(layerPath, path.join(projectDir, entry.name));
			continue;
		}

		if (entry.name.endsWith(".patch.json")) {
			const targetRel = relPath.replace(/\.patch\.json$/, ".json");
			const targetPath = path.join(projectDir, targetRel);

			await fs.ensureDir(path.dirname(targetPath));

			const baseJson = (await readJsonIfExists(targetPath)) ?? {};
			const patchJson = await fs.readJson(layerPath);

			const merged = mergeJson(baseJson, patchJson);
			await fs.writeJson(targetPath, merged, { spaces: 2 });

			continue;
		}

		if (
			/\.(patch\.ts|patch\.tsx|patch\.js|patch\.jsx|patch\.css|patch\.xml|patch\.md)$/.test(
				entry.name
			)
		) {
			const targetRel = relPath.replace(".patch.", ".");
			const targetPath = path.join(projectDir, targetRel);

			await fs.ensureDir(path.dirname(targetPath));
			await fs.copy(layerPath, targetPath);

			continue;
		}

		const targetPath = path.join(projectDir, relPath);
		await fs.ensureDir(path.dirname(targetPath));
		await fs.copy(layerPath, targetPath);
	}
}

/**
 * Safely reads a JSON file if it exists.
 *
 * If the file does not exist, returns `undefined` instead of throwing.
 *
 * @param {string} filePath - Absolute path to the JSON file.
 * @returns {Promise<any | undefined>} The parsed JSON object or `undefined` if the file does not exist.
 */
export async function readJsonIfExists(
	filePath: string
): Promise<any | undefined> {
	if (!(await fs.pathExists(filePath))) {
		return undefined;
	}
	return fs.readJson(filePath);
}

/**
 * Merges two JSON objects with special handling for dependency-style keys.
 *
 * Shallow merges the root object, then deep-merges the following keys:
 * - dependencies
 * - devDependencies
 * - peerDependencies
 * - scripts
 *
 * Patch values always override base values on conflicts.
 *
 * @param {any} base - The base JSON object (from the base template).
 * @param {any} patch - The patch JSON object (from a layer).
 * @returns {any} The merged JSON result.
 */
export function mergeJson(base: any, patch: any): any {
	const result: any = { ...base, ...patch };

	const mergeKeys = [
		"dependencies",
		"devDependencies",
		"peerDependencies",
		"scripts",
	];

	for (const key of mergeKeys) {
		if (base?.[key] || patch?.[key]) {
			result[key] = {
				...(base?.[key] ?? {}),
				...(patch?.[key] ?? {}),
			};
		}
	}

	return result;
}

/**
 * Recursively replaces {{TOKEN}} placeholders in all text files under a directory.
 *
 * Traverses the directory tree depth-first. Each file is treated as UTF-8 text.
 * If a file cannot be read as text (binary), it is skipped silently.
 *
 * @param {string} rootDir - Root directory to begin token replacement.
 * @param {Record<string, string>} tokens - Key/value pairs used for replacement.
 */
export async function replaceTokensRecursively(
	rootDir: string,
	tokens: Record<string, string>
) {
	const entries = await fs.readdir(rootDir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(rootDir, entry.name);

		if (entry.isDirectory()) {
			await replaceTokensRecursively(fullPath, tokens);
		} else {
			let content: string;
			try {
				content = await fs.readFile(fullPath, "utf8");
			} catch {
				continue;
			}

			let updated = content;
			for (const [key, value] of Object.entries(tokens)) {
				const pattern = new RegExp(`{{${key}}}`, "g");
				updated = updated.replace(pattern, value);
			}

			if (updated !== content) {
				await fs.writeFile(fullPath, updated, "utf8");
			}
		}
	}
}
