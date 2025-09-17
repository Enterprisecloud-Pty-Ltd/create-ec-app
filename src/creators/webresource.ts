import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";
import inquirer from "inquirer";

interface KendoThemeChoice {
	name: string;
	value: string;
}

// Helper function to run commands and show a spinner
const runCommand = (command: string, spinnerMessage: string): void => {
	const spinner = ora(spinnerMessage).start();
	try {
		execSync(command, { stdio: "pipe" });
		spinner.succeed();
	} catch (error) {
		spinner.fail();
		console.error(chalk.red(`Failed to execute command: ${command}`));
		console.error(error);
		process.exit(1);
	}
};

export const createWebResourceApp = async (projectName: string): Promise<void> => {
	// Prompt for UI library choice
	const { uiLibrary } = await inquirer.prompt([
		{
			type: "list",
			name: "uiLibrary",
			message: "Which UI library would you like to use?",
			choices: [
				{ name: "Kendo UI (React components with themes)", value: "kendo" },
				{ name: "Shadcn/ui (Modern React components)", value: "shadcn" },
			],
		},
	]);

	let kendoThemePackage = "";
	if (uiLibrary === "kendo") {
		// Prompt for Kendo theme
		const kendoThemes: KendoThemeChoice[] = [
			{ name: "Default", value: "@progress/kendo-theme-default" },
			{ name: "Bootstrap (v5)", value: "@progress/kendo-theme-bootstrap" },
			{ name: "Material (v3)", value: "@progress/kendo-theme-material" },
			{ name: "Fluent", value: "@progress/kendo-theme-fluent" },
			{ name: "Classic", value: "@progress/kendo-theme-classic" },
		];

		const { kendoThemePackage: selectedTheme } = await inquirer.prompt<{ kendoThemePackage: string }>([
			{
				type: "list",
				name: "kendoThemePackage",
				message: "Which Kendo UI theme would you like to install?",
				choices: kendoThemes,
			},
		]);
		kendoThemePackage = selectedTheme;
	}

	const projectDir = path.resolve(process.cwd(), projectName);
	console.log(`\nScaffolding a new project in ${chalk.green(projectDir)}...\n`);

	// Create React + Vite (TypeScript) project
	runCommand(`npm create vite@latest ${projectName} -- --template react-ts`, "Creating Vite + React + TS project...");

	process.chdir(projectDir);

	// Update package.json with overrides for Vite 7 compatibility
	const packageJsonPath = path.join(projectDir, "package.json");
	const packageJson = fs.readJsonSync(packageJsonPath);

	// Add custom build script
	packageJson.scripts["build:dev"] = "tsc -b && vite build --mode development";

	fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });
	ora("Updated package.json with Vite 7 overrides and custom build script").succeed();

	// Install dependencies based on UI library choice
	let dependencies: string[] = [
		"tailwindcss",
		"@tailwindcss/vite",
		"@tanstack/react-query",
		"zustand",
		"@types/xrm",
		"@types/node",
	];

	if (uiLibrary === "kendo") {
		dependencies.push(
			"@progress/kendo-react-buttons",
			"@progress/kendo-licensing",
			kendoThemePackage
		);
	}

	const installMessage = uiLibrary === "kendo"
		? `Installing dependencies (Kendo Theme: ${kendoThemePackage.split("/")[1]})...`
		: "Installing dependencies (Shadcn/ui)...";

	runCommand(`npm install ${dependencies.join(" ")}`, installMessage);

	if (uiLibrary === "kendo") {
		// Create kendo-tw-preset.js
		const kendoPresetPath = path.join(projectDir, "kendo-tw-preset.js");
		const kendoPresetContent = `module.exports = {
  theme: {
    extend: {
      spacing: {
        1: "var( --kendo-spacing-1 )",
        1.5: "var( --kendo-spacing-1.5 )",
        2: "var( --kendo-spacing-2 )",
        2.5: "var( --kendo-spacing-2.5 )",
        3: "var( --kendo-spacing-3 )",
        3.5: "var( --kendo-spacing-3.5 )",
        4: "var( --kendo-spacing-4 )",
        4.5: "var( --kendo-spacing-4.5 )",
        5: "var( --kendo-spacing-5 )",
        5.5: "var( --kendo-spacing-5.5 )",
        6: "var( --kendo-spacing-6 )",
        6.5: "var( --kendo-spacing-6.5 )",
        7: "var( --kendo-spacing-7 )",
        7.5: "var( --kendo-spacing-7.5 )",
        8: "var( --kendo-spacing-8 )",
        9: "var( --kendo-spacing-9 )",
        10: "var( --kendo-spacing-10 )",
        11: "var( --kendo-spacing-11 )",
        12: "var( --kendo-spacing-12 )",
        13: "var( --kendo-spacing-13 )",
        14: "var( --kendo-spacing-14 )",
        15: "var( --kendo-spacing-15 )",
        16: "var( --kendo-spacing-16 )",
        17: "var( --kendo-spacing-17 )",
        18: "var( --kendo-spacing-18 )",
        19: "var( --kendo-spacing-19 )",
        20: "var( --kendo-spacing-20 )",
        21: "var( --kendo-spacing-21 )",
        22: "var( --kendo-spacing-22 )",
        23: "var( --kendo-spacing-23 )",
        24: "var( --kendo-spacing-24 )",
        25: "var( --kendo-spacing-25 )",
        26: "var( --kendo-spacing-26 )",
        27: "var( --kendo-spacing-27 )",
        28: "var( --kendo-spacing-28 )",
        29: "var( --kendo-spacing-29 )",
        30: "var( --kendo-spacing-30 )",
      },
      borderRadius: {
        none: "var( --kendo-border-radius-none )",
        sm: "var( --kendo-border-radius-sm )",
        DEFAULT: "var( --kendo-border-radius-md )",
        lg: "var( --kendo-border-radius-lg )",
        xl: "var( --kendo-border-radius-xl )",
        "2xl": "var( --kendo-border-radius-xxl )",
        "3xl": "var( --kendo-border-radius-xxxl )",
        full: "var( --kendo-border-radius-none )",
      },
      boxShadow: {
        sm: "var( --kendo-elevation-2 )",
        DEFAULT: "var( --kendo-elevation-4 )",
        lg: "var( --kendo-elevation-6 )",
        xl: "var( --kendo-elevation-8 )",
        "2xl": "var( --keno-elevation-9 )",
      },
      colors: {
        "app-surface": "var( --kendo-color-app-surface )",
        "on-app-surface": "var( --kendo-color-on-app-surface )",
        subtle: "var( --kendo-color-subtle )",
        surface: "var( --kendo-color-surface )",
        "surface-alt": "var( --kendo-color-surface-alt )",
        border: "var( --kendo-color-border )",
        "border-alt": "var( --kendo-color-border-alt )",
        base: {
          DEFAULT: "var( --kendo-color-base )",
          hover: "var( --kendo-color-base-hover )",
          active: "var( --kendo-color-base-active )",
          emphasis: "var( --kendo-color-base-emphasis )",
          subtle: "var( --kendo-color-base-subtle )",
          "subtle-hover": "var( --kendo-color-base-subtle-hover )",
          "subtle-active": "var( --kendo-color-base-subtle-active)",
          "on-subtle": "var( --kendo-color-base-on-subtle )",
          "on-surface": "var( --kendo-color-base-on-surface )",
        },
        "on-base": "var( --kendo-color-on-base )",
        primary: {
          DEFAULT: "var( --kendo-color-primary )",
          hover: "var( --kendo-color-primary-hover )",
          active: "var( --kendo-color-primary-active )",
          emphasis: "var( --kendo-color-primary-emphasis )",
          subtle: "var( --kendo-color-primary-subtle )",
          "subtle-hover": "var( --kendo-color-primary-subtle-hover )",
          "subtle-active": "var( --kendo-color-primary-subtle-active)",
          "on-subtle": "var( --kendo-color-primary-on-subtle )",
          "on-surface": "var( --kendo-color-primary-on-surface )",
        },
        "on-primary": "var( --kendo-color-on-primary )",
        secondary: {
          DEFAULT: "var( --kendo-color-secondary )",
          hover: "var( --kendo-color-secondary-hover )",
          active: "var( --kendo-color-secondary-active )",
          emphasis: "var( --kendo-color-secondary-emphasis )",
          subtle: "var( --kendo-color-secondary-subtle )",
          "subtle-hover": "var( --kendo-color-secondary-subtle-hover )",
          "subtle-active": "var( --kendo-color-secondary-subtle-active)",
          "on-subtle": "var( --kendo-color-secondary-on-subtle )",
          "on-surface": "var( --kendo-color-secondary-on-surface )",
        },
        "on-secondary": "var( --kendo-color-on-secondary )",
        tertiary: {
          DEFAULT: "var( --kendo-color-tertiary )",
          hover: "var( --kendo-color-tertiary-hover )",
          active: "var( --kendo-color-tertiary-active )",
          emphasis: "var( --kendo-color-tertiary-emphasis )",
          subtle: "var( --kendo-color-tertiary-subtle )",
          "subtle-hover": "var( --kendo-color-tertiary-subtle-hover )",
          "subtle-active": "var( --kendo-color-tertiary-subtle-active)",
          "on-subtle": "var( --kendo-color-tertiary-on-subtle )",
          "on-surface": "var( --kendo-color-tertiary-on-surface )",
        },
        "on-tertiary": "var( --kendo-color-on-tertiary )",
        light: {
          DEFAULT: "var( --kendo-color-light )",
          hover: "var( --kendo-color-light-hover )",
          active: "var( --kendo-color-light-active )",
          emphasis: "var( --kendo-color-light-emphasis )",
          subtle: "var( --kendo-color-light-subtle )",
          "subtle-hover": "var( --kendo-color-light-subtle-hover )",
          "subtle-active": "var( --kendo-color-light-subtle-active)",
          "on-subtle": "var( --kendo-color-light-on-subtle )",
          "on-surface": "var( --kendo-color-light-on-surface )",
        },
        "on-light": "var( --kendo-color-on-light )",
        dark: {
          DEFAULT: "var( --kendo-color-dark )",
          hover: "var( --kendo-color-dark-hover )",
          active: "var( --kendo-color-dark-active )",
          emphasis: "var( --kendo-color-dark-emphasis )",
          subtle: "var( --kendo-color-dark-subtle )",
          "subtle-hover": "var( --kendo-color-dark-subtle-hover )",
          "subtle-active": "var( --kendo-color-dark-subtle-active)",
          "on-subtle": "var( --kendo-color-dark-on-subtle )",
          "on-surface": "var( --kendo-color-dark-on-surface )",
        },
        "on-dark": "var( --kendo-color-on-dark )",
        info: {
          DEFAULT: "var( --kendo-color-info )",
          hover: "var( --kendo-color-info-hover )",
          active: "var( --kendo-color-info-active )",
          emphasis: "var( --kendo-color-info-emphasis )",
          subtle: "var( --kendo-color-info-subtle )",
          "subtle-hover": "var( --kendo-color-info-subtle-hover )",
          "subtle-active": "var( --kendo-color-info-subtle-active)",
          "on-subtle": "var( --kendo-color-info-on-subtle )",
          "on-surface": "var( --kendo-color-info-on-surface )",
        },
        "on-info": "var( --kendo-color-on-info )",
        success: {
          DEFAULT: "var( --kendo-color-success )",
          hover: "var( --kendo-color-success-hover )",
          active: "var( --kendo-color-success-active )",
          emphasis: "var( --kendo-color-success-emphasis )",
          subtle: "var( --kendo-color-success-subtle )",
          "subtle-hover": "var( --kendo-color-success-subtle-hover )",
          "subtle-active": "var( --kendo-color-success-subtle-active)",
          "on-subtle": "var( --kendo-color-success-on-subtle )",
          "on-surface": "var( --kendo-color-success-on-surface )",
        },
        "on-success": "var( --kendo-color-on-success )",
        error: {
          DEFAULT: "var( --kendo-color-error )",
          hover: "var( --kendo-color-error-hover )",
          active: "var( --kendo-color-error-active )",
          emphasis: "var( --kendo-color-error-emphasis )",
          subtle: "var( --kendo-color-error-subtle )",
          "subtle-hover": "var( --kendo-color-error-subtle-hover )",
          "subtle-active": "var( --kendo-color-error-subtle-active)",
          "on-subtle": "var( --kendo-color-error-on-subtle )",
          "on-surface": "var( --kendo-color-error-on-surface )",
        },
        "on-error": "var( --kendo-color-on-error )",
        warning: {
          DEFAULT: "var( --kendo-color-warning )",
          hover: "var( --kendo-color-warning-hover )",
          active: "var( --kendo-color-warning-active )",
          emphasis: "var( --kendo-color-warning-emphasis )",
          subtle: "var( --kendo-color-warning-subtle )",
          "subtle-hover": "var( --kendo-color-warning-subtle-hover )",
          "subtle-active": "var( --kendo-color-warning-subtle-active)",
          "on-subtle": "var( --kendo-color-warning-on-subtle )",
          "on-surface": "var( --kendo-color-warning-on-surface )",
        },
        "on-warning": "var( --kendo-color-on-warning )",
        "series-a": {
          DEFAULT: "var( --kendo-color-series-a )",
          subtle: "var( --kendo-color-series-a-subtle )",
          subtler: "var( --kendo-color-series-a-subtler )",
          bold: "var( --kendo-color-series-a-bold )",
          bolder: "var( --kendo-color-series-a-bolder )",
        },
        "series-b": {
          DEFAULT: "var( --kendo-color-series-b )",
          subtle: "var( --kendo-color-series-b-subtle )",
          subtler: "var( --kendo-color-series-b-subtler )",
          bold: "var( --kendo-color-series-b-bold )",
          bolder: "var( --kendo-color-series-b-bolder )",
        },
        "series-c": {
          DEFAULT: "var( --kendo-color-series-c )",
          subtle: "var( --kendo-color-series-c-subtle )",
          subtler: "var( --kendo-color-series-c-subtler )",
          bold: "var( --kendo-color-series-c-bold )",
          bolder: "var( --kendo-color-series-c-bolder )",
        },
        "series-d": {
          DEFAULT: "var( --kendo-color-series-d )",
          subtle: "var( --kendo-color-series-d-subtle )",
          subtler: "var( --kendo-color-series-d-subtler )",
          bold: "var( --kendo-color-series-d-bold )",
          bolder: "var( --kendo-color-series-d-bolder )",
        },
        "series-e": {
          DEFAULT: "var( --kendo-color-series-e )",
          subtle: "var( --kendo-color-series-e-subtle )",
          subtler: "var( --kendo-color-series-e-subtler )",
          bold: "var( --kendo-color-series-e-bold )",
          bolder: "var( --kendo-color-series-e-bolder )",
        },
        "series-f": {
          DEFAULT: "var( --kendo-color-series-f )",
          subtle: "var( --kendo-color-series-f-subtle )",
          subtler: "var( --kendo-color-series-f-subtler )",
          bold: "var( --kendo-color-series-f-bold )",
          bolder: "var( --kendo-color-series-f-bolder )",
        },
      },
    },
  },
};`;
		fs.writeFileSync(kendoPresetPath, kendoPresetContent, "utf8");
		ora("Created kendo-tw-preset.js").succeed();

		// Create tailwind.config.js with Kendo preset
		const tailwindConfigPath = path.join(projectDir, "tailwind.config.js");
		const tailwindConfigContent = `/** @type {import('tailwindcss').Config} */

import kendoTwPreset from "./kendo-tw-preset.js";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  presets: [kendoTwPreset],
  theme: {
    extend: {
      colors: {},
    },
  },
  plugins: [],
};`;
		fs.writeFileSync(tailwindConfigPath, tailwindConfigContent, "utf8");
		ora("Created tailwind.config.js with Kendo preset").succeed();
	} else {
		// tsconfig.json
		const tsconfigPath = path.join(projectDir, "tsconfig.json");
		const tsConfigContent = `{
  "files": [],
  "references": [
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.node.json"
    }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
  }
}`;

		fs.writeFileSync(tsconfigPath, tsConfigContent, "utf8");
		ora("Updated tsconfig.json with baseUrl and paths").succeed();

		// tsconfig.app.json
		const tsconfigAppPath = path.join(projectDir, "tsconfig.app.json");
		const tsConfigAppContent = `{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Shadcn */
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    },

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
`;
		fs.writeFileSync(tsconfigAppPath, tsConfigAppContent, "utf8");
		ora("Created tsconfig.app.json").succeed();

		// index.css before we do the install
		// Update CSS entry point
		const indexCssPath = path.join(projectDir, "src", "index.css");
		fs.writeFileSync(indexCssPath, `@import "tailwindcss";`, "utf8");
		ora("Updated CSS entry point").succeed();

		// Update the vite.config.ts early to include the paths
		const viteConfigPath = path.join(projectDir, "vite.config.ts");
		const newViteConfigContent = `import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  const isDev = mode === "development" || command === "serve";

  return {
    base: "./",
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        external: ["../../token.json"],
        output: {
          manualChunks: undefined,
          entryFileNames: "[name].js",
          chunkFileNames: "[name].chunk.js",
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith(".css")) {
              return "main.css";
            }
            return "[name].[ext]";
          },
        },
      },
      minify: !isDev,
      mode: isDev ? "development" : "production",
      assetsDir: "",
      target: "es2015",
      cssCodeSplit: false,
    },
  };
});
`;
		fs.writeFileSync(viteConfigPath, newViteConfigContent, "utf8");
		ora("Replaced vite.config.ts with custom build config").succeed();

		// Initialize Shadcn/ui after basic setup
		runCommand("npx shadcn@latest init --force --silent --yes --base-color neutral", "Initializing Shadcn/ui...");

		// Install some basic Shadcn components
		runCommand("npx shadcn@latest add --all", "Installing all Shadcn components...");
	}

	if (uiLibrary === "kendo") {
		// Overwrite Vite config with advanced build options
		const viteConfigPath = path.join(projectDir, "vite.config.ts");
		const newViteConfigContent = `import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  const isDev = mode === "development" || command === "serve";

  return {
    base: "./",
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        external: ["../../token.json"],
        output: {
          manualChunks: undefined,
          entryFileNames: "[name].js",
          chunkFileNames: "[name].chunk.js",
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith(".css")) {
              return "main.css";
            }
            return "[name].[ext]";
          },
        },
      },
      minify: !isDev,
      mode: isDev ? "development" : "production",
      assetsDir: "",
      target: "es2015",
      cssCodeSplit: false,
    },
  };
});
`;
		fs.writeFileSync(viteConfigPath, newViteConfigContent, "utf8");
		ora("Replaced vite.config.ts with custom build config").succeed();
	}

	if (uiLibrary === "kendo") {
		// Update CSS entry point
		const indexCssPath = path.join(projectDir, "src", "index.css");
		fs.writeFileSync(indexCssPath, `@import "tailwindcss";`, "utf8");
		ora("Updated CSS entry point").succeed();
	}

	// Clear App.css
	const appCssPath = path.join(projectDir, "src", "App.css");
	fs.writeFileSync(appCssPath, "", "utf8");
	ora("Cleared App.css").succeed();

	// Replace App.tsx with custom content based on UI library
	const appTsxPath = path.join(projectDir, "src", "App.tsx");
	let newAppTsxContent = "";

	if (uiLibrary === "kendo") {
		newAppTsxContent = `import "./App.css";

function App() {
  return (
    <>
      <div className="flex flex-col h-screen items-center justify-center">
        Hello World!
      </div>
    </>
  );
}

export default App;
`;
	} else {
		// Shadcn/ui version - template with Shadcn components
		newAppTsxContent = `import "./App.css";
import { Button } from "@/components/ui/button";

function App() {
  return (
    <>
      <div className="flex flex-col h-screen items-center justify-center">
        <p>Hello, World!</p>
        <Button>Click me</Button>
      </div>
    </>
  );
}

export default App;
`;
	}

	fs.writeFileSync(appTsxPath, newAppTsxContent, "utf8");
	ora(`Replaced App.tsx with ${uiLibrary} template`).succeed();

	// Generate main.tsx from template
	const mainTsxPath = path.join(projectDir, "src", "main.tsx");
	const kendoImport = uiLibrary === "kendo" ? `import "${kendoThemePackage}/dist/all.css";` : "";
	const newMainTsxContent = `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
${kendoImport}
import "./index.css";
import App from "./App.tsx";

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
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
`;
	fs.writeFileSync(mainTsxPath, newMainTsxContent, "utf8");
	ora("Generated custom main.tsx with providers").succeed();

	// Modify index.html
	const indexPath = path.join(projectDir, "index.html");
	let indexContent = fs.readFileSync(indexPath, "utf8");
	indexContent = indexContent
		.replace("<title>Vite + React + TS</title>", "<title>EC | Vite + React + TS + Kendo UI + Tailwind</title>")
		.replace(
			"</head>",
			`  <script src="../../ClientGlobalContext.js.aspx" type="text/javascript"></script>\n  </head>`
		);
	fs.writeFileSync(indexPath, indexContent, "utf8");
	ora("Added ClientGlobalContext script to index.html").succeed();

	// Add .prettierrc in root directory
	const prettierRcPath = path.join(projectDir, ".prettierrc");
	const prettierRcContent = `{
	"tabWidth": 4,
	"useTabs": true,
	"semi": true,
	"singleQuote": false,
	"trailingComma": "es5",
	"bracketSpacing": true,
	"jsxBracketSameLine": false,
	"arrowParens": "always",
	"printWidth": 120
}`;
	fs.writeFileSync(prettierRcPath, prettierRcContent, "utf8");
	ora("Added .prettierrc").succeed();

	// Add token.json in root directory
	const tokenJsonPath = path.join(projectDir, "token.json");
	const tokenJsonContent = `{
	"accessToken": "",
	"expiresIn": "",
	"expires_on": 0,
	"subscription": "",
	"tenant": "",
	"tokenType": "Bearer"
}`;

	fs.writeFileSync(tokenJsonPath, tokenJsonContent, "utf8");
	ora("Added token.json").succeed();

	// Create services directory and authService.ts
	const servicesDir = path.join(projectDir, "src", "services");
	fs.ensureDirSync(servicesDir);

	const authServicePath = path.join(servicesDir, "authService.ts");
	const authServiceContent = `const getAuthToken = async (): Promise<string> => {
	const tokenModule = await import("../../token.json");
	const token = tokenModule.default.accessToken;
	return token;
};

export const getApiUrl = (): string => {
	if (window.parent && window.parent.Xrm) {
		const globalContext = window.Xrm.Utility.getGlobalContext();
		const clientUrl = globalContext.getClientUrl();
		return \`\${clientUrl}/api/data/v9.2\`;
	}

	return "https://DOMAIN.REGION.dynamics.com/api/data/v9.2";
};

export const getAuthHeaders = async (): Promise<HeadersInit> => {
	if (window.parent && window.parent.Xrm) {
		return {
			"Content-Type": "application/json",
			"OData-MaxVersion": "4.0",
			"OData-Version": "4.0",
			Prefer: 'odata.include-annotations="*"',
		};
	}

	const token = await getAuthToken();
	const headers: HeadersInit = {
		Authorization: \`Bearer \${token}\`,
		"Content-Type": "application/json",
		"OData-MaxVersion": "4.0",
		"OData-Version": "4.0",
		Prefer: 'odata.include-annotations="*"',
	};

	return headers;
};`;

	fs.writeFileSync(authServicePath, authServiceContent, "utf8");
	ora("Created authService.ts in src/services").succeed();

	// Initialize Git
	runCommand("git init", "Initializing Git repository...");
	runCommand("git add .", "Staging files for initial commit...");
	runCommand(`git commit -m "Initial commit from create-ec-app"`, "Creating initial commit...");
};