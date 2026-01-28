#!/usr/bin/env node

import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
	cancel,
	intro,
	isCancel,
	log,
	outro,
	select,
	spinner,
	text,
} from "@clack/prompts";
import fs from "fs-extra";
import { applyLayer, replaceTokensRecursively } from "./libFunctions.js";

const { execSync } = await import("node:child_process");

type AppTarget = "webresource" | "portal" | "power-pages" | "swa";
type UiTarget = "kendo" | "shadcn-ui";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
	intro("Create EC App");

	const name = await text({
		message: "Project name",
		placeholder: "my-app",
		validate(value) {
			if (value.length === 0) return "Project name cannot be empty";
			if (value.toLocaleLowerCase() !== value)
				return "Project name must be lowercase";
			if (/\s/.test(value)) return "Project name cannot contain spaces";
			if (/[^a-z0-9-_]/.test(value))
				return "Project name can only contain letters, numbers, hyphens, and underscores";
		},
	});

	if (isCancel(name)) {
		cancel("Operation cancelled.");
		process.exit(0);
	}

	const projectName = String(name).trim();

	log.step(`Creating project: ${projectName}`);

	const target = await select<AppTarget>({
		message: "What are you building?",
		options: [
			{ label: "Web Resource", value: "webresource" },
			{ label: "Portal (WIP)", value: "portal" },
			{ label: "Static Web App", value: "swa" },
			{ label: "Power Pages", value: "power-pages" },
		],
	});

	if (isCancel(target)) {
		cancel("Operation cancelled.");
		process.exit(0);
	}

	log.step(`Selected target: ${target}`);

	const uiType = await select<UiTarget>({
		message: "What UI library do you want to use?",
		options: [
			{ label: "Kendo UI", value: "kendo" },
			{ label: "Shadcn/UI", value: "shadcn-ui" },
		],
	});

	if (isCancel(uiType)) {
		cancel("Operation cancelled.");
		process.exit(0);
	}

	const shouldRunNpmInstall = await select<{ run: boolean }>({
		message: "Do you want to install dependencies?",
		options: [
			{ label: "Yes", value: { run: true } },
			{ label: "No", value: { run: false } },
		],
	});

	if (isCancel(shouldRunNpmInstall)) {
		cancel("Operation cancelled.");
		process.exit(0);
	}

	const projectDir = path.join(process.cwd(), projectName);
	const templatesRoot = path.join(__dirname, "..", "templates");

	const baseDir = path.join(templatesRoot, "base");
	const targetDir = path.join(templatesRoot, "targets", target);
	const uiDir = path.join(templatesRoot, "ui", uiType);

	await fs.copy(baseDir, projectDir);

	if (fs.existsSync(targetDir)) {
		await applyLayer(targetDir, projectDir);
	}

	if (fs.existsSync(uiDir)) {
		await applyLayer(uiDir, projectDir);
	}

	await replaceTokensRecursively(projectDir, {
		APP_NAME: projectName,
		TARGET: target,
		UI: uiType,
	});

	//WARN: This is a special case fix for having AuthContext in Kendo for Power Pages
	if (target === "power-pages" && uiType === "kendo") {
		const mainTsxPath = path.join(projectDir, "src", "main.tsx");
		await fs.writeFile(mainTsxPath, POWER_PAGES_KENDO_MAIN_TSX, "utf-8");
	}

	if (shouldRunNpmInstall.run) {
		const s = spinner();
		s.start("Running npm install...");
		const { execSync } = await import("node:child_process");
		execSync("npm install", { cwd: projectDir, stdio: "inherit" });
		s.stop("Dependencies installed.");
	}

	//INFO: npx on Windows can cause issues, so checking and creating a new gitignore
	const gitignorePath = path.join(projectDir, ".gitignore");
	if (!fs.existsSync(gitignorePath)) {
		await fs.writeFile(gitignorePath, GIT_IGNORE, "utf-8");
	}

	const sGit = spinner();
	sGit.start("Initializing git repository...");
	execSync("git init", { cwd: projectDir, stdio: "ignore" });
	execSync("git add .", { cwd: projectDir, stdio: "ignore" });
	execSync('git commit -m "Initial commit"', {
		cwd: projectDir,
		stdio: "ignore",
	});
	sGit.stop("Git repository initialized.");

	outro(
		`Scaffolded ${projectName} as ${target} with ${uiType}. Next steps: 'git remote origin add <url>'`
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});

// NOTE: Constants
const POWER_PAGES_KENDO_MAIN_TSX = `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@progress/kendo-theme-fluent/dist/all.css";
import "./index.css";
import App from "./App.tsx";

import { AuthProvider } from "./context/AuthContext.tsx";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 3,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
        mutations: {
            retry: 1,
        },
    },
});

const root = createRoot(document.getElementById("root")!);

root.render(
    <StrictMode>
        <AuthProvider>
            <QueryClientProvider client={queryClient}>
                <App />
            </QueryClientProvider>
        </AuthProvider>
    </StrictMode>
);`;

const GIT_IGNORE = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Build outputs
dist/
build/

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# node-waf configuration
.lock-wscript

# Compiled binary addons
build/Release

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# parcel-bundler cache
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db`;
