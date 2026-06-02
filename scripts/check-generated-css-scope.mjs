#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const appPath = process.argv[2];

if (!appPath) {
	console.error("Usage: node scripts/check-generated-css-scope.mjs <generated-app>");
	process.exit(1);
}

const cssPath = path.join(path.resolve(appPath), "dist", "main.css");

if (!fs.existsSync(cssPath)) {
	console.error(`Could not find ${cssPath}. Build the generated app first.`);
	process.exit(1);
}

const css = fs.readFileSync(cssPath, "utf8");

const forbidden = [
	{ name: "global body rule", pattern: /(^|})\s*body\s*\{/ },
	{
		name: "global shadcn :root token rule",
		pattern: /(^|})\s*:root\s*\{[^}]*--background\s*:/,
	},
	{
		name: "global shadcn dark token rule",
		pattern: /(^|})\s*\.dark\s*\{[^}]*--background\s*:/,
	},
	{ name: "unprefixed flex utility", pattern: /(^|})\s*\.flex\s*\{/ },
	{ name: "unprefixed grid utility", pattern: /(^|})\s*\.grid\s*\{/ },
	{ name: "unprefixed hidden utility", pattern: /(^|})\s*\.hidden\s*\{/ },
	{
		name: "unprefixed bg-background utility",
		pattern: /(^|})\s*\.bg-background\s*\{/,
	},
];

const required = [
	{ name: "ec app scope", pattern: /\.ec-app\b/ },
	{ name: "prefixed flex utility", pattern: /\.ec\\:flex\b/ },
];

const failures = [
	...forbidden.filter((check) => check.pattern.test(css)).map((check) => check.name),
	...required
		.filter((check) => !check.pattern.test(css))
		.map((check) => `missing ${check.name}`),
];

if (failures.length > 0) {
	console.error("CSS scope check failed:");
	for (const failure of failures) {
		console.error(`- ${failure}`);
	}
	process.exit(1);
}

console.log("CSS scope check passed.");
