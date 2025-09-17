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

export const createPowerPagesApp = async (projectName: string): Promise<void> => {
	// Prompt for Kendo theme
	const kendoThemes: KendoThemeChoice[] = [
		{ name: "Default", value: "@progress/kendo-theme-default" },
		{ name: "Bootstrap (v5)", value: "@progress/kendo-theme-bootstrap" },
		{ name: "Material (v3)", value: "@progress/kendo-theme-material" },
		{ name: "Fluent", value: "@progress/kendo-theme-fluent" },
		{ name: "Classic", value: "@progress/kendo-theme-classic" },
	];

	const { kendoThemePackage } = await inquirer.prompt<{ kendoThemePackage: string }>([
		{
			type: "list",
			name: "kendoThemePackage",
			message: "Which Kendo UI theme would you like to install?",
			choices: kendoThemes,
		},
	]);

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

	// Install dependencies with version constraints and overrides
	const dependencies: string[] = [
		"@progress/kendo-react-buttons",
		"@progress/kendo-licensing",
		"tailwindcss@^4",
		"@tailwindcss/vite@^4",
		"@tanstack/react-query",
		"zustand",
		"@types/xrm",
		"@types/node",
		kendoThemePackage,
	];
	runCommand(
		`npm install ${dependencies.join(" ")}`,
		`Installing dependencies (Theme: ${kendoThemePackage.split("/")[1]})...`
	);

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

	// Overwrite Vite config with advanced build options
	const viteConfigPath = path.join(projectDir, "vite.config.ts");
	const newViteConfigContent = `import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
`;
	fs.writeFileSync(viteConfigPath, newViteConfigContent, "utf8");
	ora("Replaced vite.config.ts with custom build config").succeed();

	// Update CSS entry point
	const indexCssPath = path.join(projectDir, "src", "index.css");
	fs.writeFileSync(indexCssPath, `@import "tailwindcss";`, "utf8");
	ora("Updated CSS entry point").succeed();

	// Clear App.css
	const appCssPath = path.join(projectDir, "src", "App.css");
	fs.writeFileSync(appCssPath, "", "utf8");
	ora("Cleared App.css").succeed();

	// Create shared AuthButton component
	const componentsDir = path.join(projectDir, "src", "components");
	const sharedDir = path.join(componentsDir, "shared");
	fs.ensureDirSync(sharedDir);

	const authButtonPath = path.join(sharedDir, "AuthButton.tsx");
	const authButtonContent = `import { useAuth } from '../../context/AuthContext';

export const AuthButton = () => {
  const { user, isAuthenticated, isLoading, tenantId, token } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
        <span>Loading...</span>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">
          Welcome {user.firstName} {user.lastName}
        </span>
        <button
          type="button"
          className="rounded border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          onClick={() => (window.location.href = '/Account/Login/LogOff?returnUrl=%2F')}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <form action="/Account/Login/ExternalLogin" method="post" className="flex items-center gap-3">
      <input name="__RequestVerificationToken" type="hidden" value={token ?? ''} />
      <button
        name="provider"
        type="submit"
        className="rounded border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        value={\`https://login.windows.net/\${tenantId}/\`}
      >
        Log In
      </button>
    </form>
  );
};
`;
	fs.writeFileSync(authButtonPath, authButtonContent, "utf8");
	ora("Created AuthButton.tsx in src/components/shared").succeed();

	// Replace App.tsx with custom content
	const appTsxPath = path.join(projectDir, "src", "App.tsx");
	const newAppTsxContent = `import "./App.css";
import { AuthProvider } from './context/AuthContext'
import { AuthButton } from './components/shared/AuthButton'

function App() {
  return (
    <>
      <AuthProvider>
        <div className="flex flex-col h-screen items-center justify-center">
          Hello World!
        </div>
      </AuthProvider>
    </>
  );
}

export default App;
`;
	fs.writeFileSync(appTsxPath, newAppTsxContent, "utf8");
	ora("Replaced App.tsx with custom template").succeed();

	// Generate main.tsx from template
	const mainTsxPath = path.join(projectDir, "src", "main.tsx");
	const newMainTsxContent = `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "${kendoThemePackage}/dist/all.css";
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
	indexContent = indexContent.replace(
		"<title>Vite + React + TS</title>",
		"<title>EC | Vite + React + TS + Kendo UI + Tailwind</title>"
	);
	fs.writeFileSync(indexPath, indexContent, "utf8");
	ora("Updated index.html").succeed();

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

	// Add in the AuthContext
	const contextDir = path.join(projectDir, "src", "context");
	fs.ensureDirSync(contextDir);

	const authContextPath = path.join(contextDir, "AuthContext.tsx");
	const authContextContent = `import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  username: string;
  firstName: string;
  lastName: string;
  email?: string;
  userRoles: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tenantId: string;
  token: string;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string>('');

  const refreshToken = async (): Promise<void> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newToken = await (window as any).shell?.getTokenDeferred();
      setToken(newToken || '');
    } catch (error) {
      console.error('Error fetching token:', error);
      setToken('');
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if Microsoft Dynamics Portal object exists
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const portalUser = (window as any)?.Microsoft?.Dynamic365?.Portal?.User;

        if (portalUser) {
          const username = portalUser.userName || '';
          const firstName = portalUser.firstName || '';
          const lastName = portalUser.lastName || '';
          const email = portalUser.email || '';
          const userRoles = portalUser.userRoles || [];

          if (username) {
            setUser({
              username,
              firstName,
              lastName,
              email,
              userRoles
            });
          }
        }

        // Get authentication token
        await refreshToken();
      } catch (error) {
        console.error('Error initializing authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tenantId = (window as any)?.Microsoft?.Dynamic365?.Portal?.tenant || '';
  const isAuthenticated = user !== null && user.username !== '';

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    tenantId,
    token,
    refreshToken
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};`;

	fs.writeFileSync(authContextPath, authContextContent, "utf8");
	ora("Created AuthContext.tsx in src/context").succeed();

	// Create services directory and DataService.ts
	const servicesDir = path.join(projectDir, "src", "services");
	fs.ensureDirSync(servicesDir);

	const dataServicePath = path.join(servicesDir, "DataService.ts");
	const dataServiceContent = `export interface T {
  entityId: string;
  [key: string]: unknown;
}

export interface ApiResponse<T> {
  value: T[];
}

const BASE_URL = '/_api';

export async function getEntity(): Promise<T[]> {
  const response = await fetch(\`\${BASE_URL}/entity\`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(\`Failed to fetch entity: \${response.status}\`);
  }

  const data: ApiResponse<T> = await response.json();
  return data.value;
}
`;

	fs.writeFileSync(dataServicePath, dataServiceContent, "utf8");
	ora("Created DataService.ts in src/services").succeed();

	// Add Power Pages configuration file
	const powerPagesConfigPath = path.join(projectDir, "powerpages.config.json");
	const powerPagesConfigContent = `{
  "compiledPath": "dist",
  "siteName": "MySite",
  "defaultLandingPage": "index.html"
}
`;
	fs.writeFileSync(powerPagesConfigPath, powerPagesConfigContent, "utf8");
	ora("Created powerpages.config.json").succeed();

	// Initialize Git
	runCommand("git init", "Initializing Git repository...");
	runCommand("git add .", "Staging files for initial commit...");
	runCommand(`git commit -m "Initial commit from create-ec-app"`, "Creating initial commit...");
};