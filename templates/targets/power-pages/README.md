# EC Power Pages single-page application

This React, TypeScript, and Vite app targets the Power Pages code-site model. Run `npm install`, then `npm run dev` for local UI work. Run `npm run check` and `npm run build` before upload.

## Power Pages runtime

Power Pages manages authentication and authorization for the deployed site. Configure identity providers, page permissions, table permissions, web roles, and the Power Pages Web API in the target site. Do not add a second production authentication client to the SPA.

The host exposes the current user through `window.Microsoft.Dynamic365.Portal.User`. The generated `src/powerPages.ts` module provides `getPowerPagesUser()` with a typed subset of that object. An empty user name means that the visitor is anonymous.

Use root-relative `/_api/...` URLs for Dataverse calls. The hosted session supplies authentication, and every Power Pages Web API request must include a CSRF token. `getRequestVerificationToken()` reads the token from the documented `/_layout/tokenhtml` endpoint:

```ts
import { getRequestVerificationToken } from "@/powerPages";

const token = await getRequestVerificationToken();
const response = await fetch("/_api/accounts?$select=name&$top=5", {
	headers: {
		"Content-Type": "application/json",
		__RequestVerificationToken: token,
	},
});

if (!response.ok) {
	throw new Error(
		`Power Pages account request failed (${response.status} ${response.statusText}).`,
	);
}
```

Enable each table and its explicit columns with the relevant `Webapi/<table>/enabled` and `Webapi/<table>/fields` site settings. Power Pages applies table permissions and web roles to each request.

## Local API development

Copy `.env.example` to `.env.local` and set `VITE_POWER_PAGES_URL` to the development site URL before using `/_api` locally. Vite enables the proxy only when that variable is present, so an unconfigured app cannot send API requests to a placeholder site. Do not point local work at production.

Power Pages does not pass its hosted browser session to localhost. Microsoft currently documents ADAL.js with Microsoft Entra v1 as the development-only bearer-authentication route for code sites. MSAL v2 is not compatible with this Power Pages flow. This setup requires:

- Power Pages version 9.7.6.6 or later.
- SPA authentication and the localhost redirect URI on the site's Entra application.
- `Authentication/BearerAuthentication/Enabled = true`.
- `Authentication/BearerAuthentication/Protocol = OpenIdConnect`.
- `Authentication/BearerAuthentication/Provider = AzureAD`.
- A public development site.
- An `Authorization: Bearer <id_token>` header on local Web API calls.

Apply those settings only in a development environment. The scaffold does not load ADAL automatically because deployed code uses the Power Pages session and local Entra values are environment-specific. The `getRequestVerificationToken()` helper is for the hosted session. Local bearer-authenticated requests use the Entra ID token described above.

See Microsoft's [code-site guide](https://learn.microsoft.com/en-us/power-pages/configure/create-code-sites) and [Power Pages Web API overview](https://learn.microsoft.com/en-us/power-pages/configure/web-api-overview) for the current setup and security contract.

## Build and upload

`powerpages.config.json` tells PAC CLI to upload `dist`, use `index.html` as the landing page, and remove stale Vite bundles matching the configured patterns. Change `siteName` to the intended Power Pages display name if the generated project name is not suitable.

Build the app, authenticate PAC CLI to the intended non-production environment, and upload with:

```bash
npm run build
pac pages upload-code-site --rootPath .
```

Uploading changes an external environment. Confirm the environment and site before running it. See [docs/tooling.md](docs/tooling.md) for the compiler, lint, and editor setup.
