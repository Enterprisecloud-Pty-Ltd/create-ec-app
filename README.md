# create-ec-app

🚀 **Unified CLI tool to create different types of EC applications**

Create React, Next.js, Power Pages, and React Native applications with a single command. Each app comes pre-configured with the tools and patterns you need for building enterprise applications.

## Quick Start

### npm (recommended)

```bash
npx create-ec-app my-awesome-project
```

### bun

```bash
bunx create-ec-app my-awesome-project
```

### pnpm

```bash
pnpm create ec-app my-awesome-project
```

## App Types

### 📱 Webresource App

Perfect for Dynamics 365 webresources

- **Framework**: React + Vite + TypeScript
- **Styling**: Tailwind CSS + Kendo UI
- **Features**:
  - Pre-configured for Dynamics 365 embedding
  - Kendo UI theme selection
  - TanStack Query for data fetching
  - Zustand for state management
  - XRM type definitions

### 🌐 Portal App

Ideal for customer portals and external-facing applications

- **Framework**: Next.js + TypeScript
- **Styling**: Choice of Kendo UI or Shadcn/ui
- **Features**:
  - NextAuth.js authentication
  - Dynamics 365 integration
  - GitHub Actions workflow
  - Environment configuration

### ⚡ Power Pages App

Specialized for Microsoft Power Pages

- **Framework**: React + Vite + TypeScript
- **Styling**: Tailwind CSS + Kendo UI
- **Features**:
  - Power Pages authentication context
  - Portal-specific data services
  - Pre-built auth components
  - Power Pages configuration

### 📲 Mobile App

Cross-platform mobile development

- **Framework**: React Native + Expo + TypeScript
- **Styling**: NativeWind (Tailwind for React Native)
- **Features**:
  - MSAL.js authentication
  - React Native Reusables components
  - TanStack Query
  - Pre-configured navigation

## Installation & Usage

### Option 1: Direct Usage (Recommended)

**npm**:

```bash
npx create-ec-app@latest my-project
```

**bun**:

```bash
bunx create-ec-app@latest my-project
```

**pnpm**:

```bash
pnpm create ec-app@latest my-project
```

### Option 2: Global Installation

**npm**:

```bash
npm install -g create-ec-app
create-ec-app my-project
```

**bun**:

```bash
bun add -g create-ec-app
create-ec-app my-project
```

**pnpm**:

```bash
pnpm add -g create-ec-app
create-ec-app my-project
```

**yarn**:

```bash
yarn global add create-ec-app
create-ec-app my-project
```

## Getting Started

1. **Run the command**:

   ```bash
   npx create-ec-app my-project
   # or with your preferred package manager
   ```

2. **Choose your application type** from the interactive menu

3. **Follow the prompts** for additional configuration (themes, UI libraries, etc.)

4. **Start developing**:
   ```bash
   cd my-project
   npm run dev
   # or: bun dev, pnpm dev, yarn dev
   ```

## What's Included

All applications come with:

- ✅ TypeScript configuration
- ✅ ESLint and Prettier setup
- ✅ Git repository initialization
- ✅ Environment configuration
- ✅ Build and development scripts
- ✅ Enterprise-ready folder structure

### Webresource & Power Pages Apps Include:

- Kendo UI components and theming
- Dynamics 365 authentication helpers
- TanStack Query setup
- Zustand store configuration

### Portal Apps Include:

- NextAuth.js configuration
- Choice of UI library (Kendo UI or Shadcn/ui)
- GitHub Actions deployment workflow example
- Environment variable templates

### Mobile Apps Include:

- Expo development build configuration
- NativeWind styling system
- MSAL authentication setup
- Navigation structure

## Development

To contribute to this tool:

```bash
git clone <repository-url>
cd create-ec-app
npm install
npm run build
npm link
```

## License

MIT

---

**Note**: For Kendo UI apps, remember to activate your license after project creation:

```bash
npx kendo-ui-license activate
```
