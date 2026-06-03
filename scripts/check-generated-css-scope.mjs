#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";

const pcfPath = process.argv[2];

if (!pcfPath) {
	console.error("Usage: node scripts/check-generated-css-scope.mjs <generated-pcf-control>");
	process.exit(1);
}

const cssPath = path.join(path.resolve(pcfPath), "pcf-scoped.css");

if (!fs.existsSync(cssPath)) {
	console.error(`Could not find ${cssPath}. Generate the PCF control first.`);
	process.exit(1);
}

const css = fs.readFileSync(cssPath, "utf8");
const root = postcss.parse(css, { from: cssPath });
const failures = [];

root.walkRules((rule) => {
	if (!rule.nodes?.some((node) => node.type === "decl" && node.prop.startsWith("--"))) {
		return;
	}

	for (const selector of splitSelectorList(rule.selector)) {
		if (!selector.includes(".ec-pcf-shell-control")) {
			failures.push(`unscoped custom-property rule: ${selector}`);
		}
	}
});

if (!css.includes("[data-ec-pcf-control=")) {
	failures.push("missing PCF control data attribute scope");
}

if (failures.length > 0) {
	console.error("PCF CSS variable scope check failed:");
	for (const failure of failures) {
		console.error(`- ${failure}`);
	}
	process.exit(1);
}

console.log("PCF CSS variable scope check passed.");

function splitSelectorList(selectorList) {
	const selectors = [];
	let start = 0;
	let nesting = 0;
	let quote = null;
	let escaped = false;

	for (let index = 0; index < selectorList.length; index += 1) {
		const char = selectorList[index];

		if (escaped) {
			escaped = false;
			continue;
		}

		if (char === "\\") {
			escaped = true;
			continue;
		}

		if (quote) {
			if (char === quote) {
				quote = null;
			}
			continue;
		}

		if (char === '"' || char === "'") {
			quote = char;
			continue;
		}

		if (char === "(" || char === "[") {
			nesting += 1;
			continue;
		}

		if (char === ")" || char === "]") {
			nesting = Math.max(0, nesting - 1);
			continue;
		}

		if (char === "," && nesting === 0) {
			selectors.push(selectorList.slice(start, index).trim());
			start = index + 1;
		}
	}

	selectors.push(selectorList.slice(start).trim());
	return selectors.filter(Boolean);
}
