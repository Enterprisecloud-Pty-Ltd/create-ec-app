import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";
import inquirer from "inquirer";

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

// Template functions
const getKendoTailwindPreset = (): string => `module.exports = {
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
        "2xl": "var( --kendo-elevation-9 )",
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
      },
    },
  },
};`;

const getTailwindConfig = (): string => `/** @type {import('tailwindcss').Config} */
const kendoTwPreset = require('./kendo-tw-preset.js');

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  presets: [kendoTwPreset],
  theme: {
    extend: {},
  },
  plugins: [],
}`;

const getLayoutTemplate = (kendoThemePackage: string): string => `import { Inter } from 'next/font/google'
import '@progress/kendo-theme-${kendoThemePackage.split("-").pop()}/dist/all.css'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Portal App',
  description: 'Next.js Portal application with Kendo UI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}`;

const getShadcnLayoutTemplate = (): string => `import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Portal App',
  description: 'Next.js Portal application with Shadcn/ui',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}`;

const getProvidersTemplate = (): string => `'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
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
  }))

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  )
}`;

const getShadcnProvidersTemplate = (): string => `'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
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
  }))

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  )
}`;

const getPageTemplate = (): string => `'use client';

import { Button } from '@progress/kendo-react-buttons';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useDynamicsAccounts } from '@/hooks/useDynamicsAccounts';

export default function Home() {
  const { data: session, status } = useSession();
  const { data: accounts, isLoading, error } = useDynamicsAccounts();

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">Loading...</h1>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">Welcome to Portal App</h1>
          <p className="text-lg mb-8">Sign in to access your Dynamics 365 data</p>
          <Button onClick={() => signIn('azure-ad')}>
            Sign in with Microsoft
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col p-24">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome, {session.user?.name}!</h1>
        <Button onClick={() => signOut()}>Sign out</Button>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Dynamics 365 Accounts</h2>

        {isLoading && <p>Loading accounts...</p>}
        {error && <p className="text-red-500">Error loading accounts: {error.message}</p>}

        {accounts && (
          <div className="grid gap-4">
            {accounts.map((account) => (
              <div key={account.accountid} className="border p-4 rounded">
                <h3 className="font-semibold">{account.name}</h3>
                <p className="text-gray-600">{account.emailaddress1}</p>
                <p className="text-sm text-gray-500">ID: {account.accountid}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}`;

const getShadcnPageTemplate = (): string => `'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useDynamicsAccounts } from '@/hooks/useDynamicsAccounts';

export default function Home() {
  const { data: session, status } = useSession();
  const { data: accounts, isLoading, error } = useDynamicsAccounts();

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">Loading...</h1>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">Welcome to Portal App</h1>
          <p className="text-lg mb-8">Sign in to access your Dynamics 365 data</p>
          <Button onClick={() => signIn('azure-ad')}>
            Sign in with Microsoft
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col p-24">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome, {session.user?.name}!</h1>
        <Button onClick={() => signOut()}>Sign out</Button>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Dynamics 365 Accounts</h2>

        {isLoading && <p>Loading accounts...</p>}
        {error && <p className="text-red-500">Error loading accounts: {error.message}</p>}

        {accounts && (
          <div className="grid gap-4">
            {accounts.map((account) => (
              <Card key={account.accountid}>
                <CardHeader>
                  <CardTitle>{account.name}</CardTitle>
                  <CardDescription>{account.emailaddress1}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">ID: {account.accountid}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}`;

const getGlobalsCSS = (): string => `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}`;

const getPrettierConfig = (): string => `{
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "jsxBracketSameLine": false,
  "arrowParens": "always",
  "printWidth": 80
}`;

const getEnvConfig = (): string => `# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000

# Microsoft Azure AD Configuration
AZURE_AD_CLIENT_ID=your-azure-ad-client-id
AZURE_AD_CLIENT_SECRET=your-azure-ad-client-secret
AZURE_AD_TENANT_ID=your-azure-ad-tenant-id

# Dynamics 365 Configuration
DYNAMICS_BASE_URL=https://your-org.crm.dynamics.com
DYNAMICS_API_VERSION=v9.2
`;

const authConfig = (): string => `import NextAuth from 'next-auth'
import AzureADProvider from 'next-auth/providers/azure-ad'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
})`;

const getAuthRoute = (): string => `import { handlers } from '@/auth'

export const { GET, POST } = handlers`;

const getDynamicsAccountsRoute = (): string => `import { auth } from '@/auth'
import { getDynamicsData } from '@/lib/dynamics'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accounts = await getDynamicsData('accounts', {
      select: ['accountid', 'name', 'emailaddress1', 'telephone1', 'websiteurl'],
      top: 10,
    })

    return NextResponse.json(accounts)
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    )
  }
}`;

const getDynamicsLib = (): string => `export interface DynamicsAccount {
  accountid: string
  name: string
  emailaddress1?: string
  telephone1?: string
  websiteurl?: string
}

interface QueryOptions {
  select?: string[]
  filter?: string
  orderby?: string
  top?: number
  skip?: number
}

export async function getDynamicsData(
  entityName: string,
  options: QueryOptions = {}
): Promise<any> {
  const baseUrl = process.env.DYNAMICS_BASE_URL
  const apiVersion = process.env.DYNAMICS_API_VERSION || 'v9.2'

  if (!baseUrl) {
    throw new Error('DYNAMICS_BASE_URL environment variable is not set')
  }

  let url = \`\${baseUrl}/api/data/\${apiVersion}/\${entityName}\`
  const params = new URLSearchParams()

  if (options.select) {
    params.append('$select', options.select.join(','))
  }

  if (options.filter) {
    params.append('$filter', options.filter)
  }

  if (options.orderby) {
    params.append('$orderby', options.orderby)
  }

  if (options.top) {
    params.append('$top', options.top.toString())
  }

  if (options.skip) {
    params.append('$skip', options.skip.toString())
  }

  const queryString = params.toString()
  if (queryString) {
    url += \`?\${queryString}\`
  }

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Prefer': 'odata.include-annotations="*"',
    },
  })

  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`)
  }

  const data = await response.json()
  return data.value || data
}`;

const getDynamicsAccountsHook = (): string => `'use client'

import { useQuery } from '@tanstack/react-query'
import { DynamicsAccount } from '@/lib/dynamics'

export function useDynamicsAccounts() {
  return useQuery<DynamicsAccount[]>({
    queryKey: ['dynamics', 'accounts'],
    queryFn: async () => {
      const response = await fetch('/api/dynamics/accounts')

      if (!response.ok) {
        throw new Error('Failed to fetch accounts')
      }

      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  })
}`;

const compilerOptions = (): string => `{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`;

const getGithubWorkflow = (): string => `name: Deploy to Azure

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build application
      run: npm run build
      env:
        NEXTAUTH_URL: \${{ secrets.NEXTAUTH_URL }}
        NEXTAUTH_SECRET: \${{ secrets.NEXTAUTH_SECRET }}
        AZURE_AD_CLIENT_ID: \${{ secrets.AZURE_AD_CLIENT_ID }}
        AZURE_AD_CLIENT_SECRET: \${{ secrets.AZURE_AD_CLIENT_SECRET }}
        AZURE_AD_TENANT_ID: \${{ secrets.AZURE_AD_TENANT_ID }}
        DYNAMICS_BASE_URL: \${{ secrets.DYNAMICS_BASE_URL }}
        DYNAMICS_API_VERSION: \${{ secrets.DYNAMICS_API_VERSION }}

    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: \${{ secrets.AZURE_WEBAPP_NAME }}
        publish-profile: \${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: .`;

const getNextConfig = (): string => `import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['@progress/kendo-react-buttons', '@progress/kendo-react-inputs'],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    }
    return config
  },
}

export default nextConfig`;

export const createPortalApp = async (projectName: string): Promise<void> => {
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
    const response = await inquirer.prompt([
      {
        type: "list",
        name: "kendoThemePackage",
        message: "Which Kendo UI theme would you like to install?",
        choices: [
          { name: "Default", value: "@progress/kendo-theme-default" },
          { name: "Bootstrap (v5)", value: "@progress/kendo-theme-bootstrap" },
          { name: "Material (v3)", value: "@progress/kendo-theme-material" },
          { name: "Fluent", value: "@progress/kendo-theme-fluent" },
          { name: "Classic", value: "@progress/kendo-theme-classic" },
        ],
      },
    ]);
    kendoThemePackage = response.kendoThemePackage;
  }

  // Ensure the project directory exists
  const projectDir = path.resolve(process.cwd(), projectName);
  await fs.ensureDir(projectDir);

  console.log(`\nScaffolding a new project in ${chalk.green(projectDir)}...\n`);

  // Create Next.js project with TypeScript
  runCommand(
    `npx create-next-app@latest ${projectName} --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack`,
    "Creating Next.js + TypeScript project..."
  );

  process.chdir(projectDir);

  // Install additional dependencies based on UI library choice
  let dependencies = ["@tanstack/react-query", "zustand", "next-auth@beta"];
  let devDependencies: string[] = [];

  if (uiLibrary === "kendo") {
    dependencies.push(
      "@progress/kendo-react-buttons",
      "@progress/kendo-react-layout",
      "@progress/kendo-react-inputs",
      "@progress/kendo-react-grid",
      "@progress/kendo-react-dateinputs",
      "@progress/kendo-react-dropdowns",
      "@progress/kendo-react-dialogs",
      "@progress/kendo-licensing",
      kendoThemePackage
    );
  } else {
    devDependencies.push("tailwindcss-animate");
  }

  const installMessage = uiLibrary === "kendo"
    ? `Installing dependencies (Kendo Theme: ${kendoThemePackage.split("/")[1]})...`
    : "Installing dependencies (Shadcn/ui)...";

  runCommand(`npm install ${dependencies.join(" ")}`, installMessage);

  if (devDependencies.length > 0) {
    runCommand(
      `npm install -D ${devDependencies.join(" ")}`,
      "Installing dev dependencies..."
    );
  }

  // Update package.json with Portal-specific scripts
  const packageJsonPath = path.join(projectDir, "package.json");
  const packageJson = await fs.readJson(packageJsonPath);

  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  packageJson.scripts["export"] = "next build";
  packageJson.scripts["serve"] = "npx serve@latest dist";

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  ora("Updated package.json with Portal-specific scripts").succeed();

  if (uiLibrary === "kendo") {
    // Create Kendo Tailwind preset
    const kendoPresetPath = path.join(projectDir, "kendo-tw-preset.js");
    await fs.writeFile(kendoPresetPath, getKendoTailwindPreset(), "utf8");
    ora("Created kendo-tw-preset.js").succeed();

    // Replace Tailwind config
    const tailwindConfigPath = path.join(projectDir, "tailwind.config.js");
    await fs.writeFile(tailwindConfigPath, getTailwindConfig(), "utf8");
    ora("Updated tailwind.config.js with Kendo preset").succeed();

    // Replace app layout
    const layoutPath = path.join(projectDir, "src", "app", "layout.tsx");
    await fs.writeFile(layoutPath, getLayoutTemplate(kendoThemePackage), "utf8");
    ora("Updated app layout with Kendo theme import").succeed();

    // Create providers component
    const providersPath = path.join(projectDir, "src", "app", "providers.tsx");
    await fs.writeFile(providersPath, getProvidersTemplate(), "utf8");
    ora("Created providers component").succeed();

    // Replace page template
    const pagePath = path.join(projectDir, "src", "app", "page.tsx");
    await fs.writeFile(pagePath, getPageTemplate(), "utf8");
    ora("Updated home page with Portal integration").succeed();

    // Update globals.css
    const globalsCssPath = path.join(projectDir, "src", "app", "globals.css");
    await fs.writeFile(globalsCssPath, getGlobalsCSS(), "utf8");
    ora("Updated globals.css").succeed();
  } else {
    // Shadcn/ui setup
    runCommand(
      "npx shadcn@latest init --force --silent --yes --base-color neutral",
      "Setting up Shadcn/ui..."
    );

    runCommand(
      "npx shadcn@latest add --all",
      "Installing all Shadcn/ui components..."
    );

    // Replace app layout
    const layoutPath = path.join(projectDir, "src", "app", "layout.tsx");
    await fs.writeFile(layoutPath, getShadcnLayoutTemplate(), "utf8");
    ora("Updated app layout for Shadcn/ui").succeed();

    // Create providers component
    const providersPath = path.join(projectDir, "src", "app", "providers.tsx");
    await fs.writeFile(providersPath, getShadcnProvidersTemplate(), "utf8");
    ora("Created providers component").succeed();

    // Replace page template
    const pagePath = path.join(projectDir, "src", "app", "page.tsx");
    await fs.writeFile(pagePath, getShadcnPageTemplate(), "utf8");
    ora("Updated home page with Shadcn/ui integration").succeed();
  }

  // Add .prettierrc
  const prettierRcPath = path.join(projectDir, ".prettierrc");
  await fs.writeFile(prettierRcPath, getPrettierConfig(), "utf8");
  ora("Added .prettierrc configuration").succeed();

  // Add Compiler Options
  const tsConfigPath = path.join(projectDir, "tsconfig.json");
  await fs.writeFile(tsConfigPath, compilerOptions(), "utf8");
  ora("Added TypeScript compiler options").succeed();

  // Add .env.local
  const envLocalPath = path.join(projectDir, ".env.local");
  await fs.writeFile(envLocalPath, getEnvConfig(), "utf8");
  ora("Added .env.local configuration").succeed();
  runCommand("npx auth secret", "Adding secret to .env.local");

  // Add auth config file
  const authConfigPath = path.join(projectDir, "auth.ts");
  await fs.writeFile(authConfigPath, authConfig(), "utf8");
  ora("Added auth.ts configuration").succeed();

  // Add NextAuth route handler
  const authRouteDir = path.join(projectDir, "src", "app", "api", "auth", "[...nextauth]");
  await fs.ensureDir(authRouteDir);
  const authRoutePath = path.join(authRouteDir, "route.ts");
  await fs.writeFile(authRoutePath, getAuthRoute(), "utf8");
  ora("Added NextAuth route handler").succeed();

  // Add Dynamics accounts API route
  const dynamicsAccountsRouteDir = path.join(projectDir, "src", "app", "api", "dynamics", "accounts");
  await fs.ensureDir(dynamicsAccountsRouteDir);
  const dynamicsAccountsRoutePath = path.join(dynamicsAccountsRouteDir, "route.ts");
  await fs.writeFile(dynamicsAccountsRoutePath, getDynamicsAccountsRoute(), "utf8");
  ora("Added Dynamics accounts API route").succeed();

  // Add next.config.ts with standalone settings
  const nextConfigPath = path.join(projectDir, "next.config.ts");
  await fs.writeFile(nextConfigPath, getNextConfig(), "utf8");
  ora("Updated next.config.ts with standalone settings").succeed();

  // Add github workflow for deployment
  const workflowFilePath = path.join(projectDir, "example.deploy.yml");
  await fs.writeFile(workflowFilePath, getGithubWorkflow(), "utf8");
  ora("Added GitHub workflow for Azure deployment").succeed();

  // Add Dynamics lib helper
  const dynamicsLibDir = path.join(projectDir, "src", "lib");
  await fs.ensureDir(dynamicsLibDir);
  const dynamicsLibPath = path.join(dynamicsLibDir, "dynamics.ts");
  await fs.writeFile(dynamicsLibPath, getDynamicsLib(), "utf8");
  ora("Added Dynamics library helper").succeed();

  // Add Dynamics accounts React Query hook
  const hooksDir = path.join(projectDir, "src", "hooks");
  await fs.ensureDir(hooksDir);
  const dynamicsAccountsHookPath = path.join(hooksDir, "useDynamicsAccounts.ts");
  await fs.writeFile(dynamicsAccountsHookPath, getDynamicsAccountsHook(), "utf8");
  ora("Added Dynamics accounts React Query hook").succeed();

  // Initialize Git
  runCommand("git init", "Initializing Git repository...");
  runCommand("git add .", "Staging files for initial commit...");
  runCommand(`git commit -m "Initial commit from create-ec-app"`, "Creating initial commit...");
};