# Portal target contract

`portal` is intended to provide an Azure Static Web Apps frontend with Microsoft Entra authentication and an Azure Function App broker for Dataverse access. It reuses the SWA frontend foundation and adds a backend and a distinct authorization boundary.

## Request flow

1. The user signs in through SWA's built-in authentication with Microsoft Entra ID.
2. The React frontend calls relative `/api/...` endpoints through SWA.
3. The linked Function App receives the authenticated caller identity and authorizes the requested operation and records.
4. The Function App obtains its own Dataverse token using a service principal registered as a Dataverse application user with a limited security role.
5. Dataverse responds to the broker, which returns the permitted response to the frontend. Dataverse credentials and app-only access tokens stay on the server.

SWA forwards client-principal information in `x-ms-client-principal`. That header is identity data, not a bearer token or a signature. Trust it only behind the configured SWA-to-Function authentication boundary; an arbitrary direct caller must not be able to supply a forged header. A separately exposed bearer-authenticated API instead needs its own token validation, including issuer and audience checks. See [SWA user information](https://learn.microsoft.com/en-us/azure/static-web-apps/user-information) and [linked Function App authentication](https://learn.microsoft.com/en-us/azure/static-web-apps/functions-bring-your-own).

The browser's identity and the Dataverse application identity have different jobs. Dataverse applies the application user's security role. The broker must enforce each portal caller's allowed operations, rows, and writable fields, and record caller identity for audit correlation. Provide explicit business endpoints rather than an unrestricted Dataverse URL/OData forwarding proxy. See [Dataverse server-to-server authentication](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/use-single-tenant-server-server-authentication).

## Current implementation

The current generator applies the shared React/Vite base and selected UI layer for `portal`. It does not apply the SWA target layer, scaffold a Function App, configure authentication, generate a portal `AGENTS.md`, or verify a broker integration.

The older implementation in commit `5a3a0ff` used Next.js/NextAuth with a server-side Dataverse route. The V2 rewrite in `39b83b0` removed that generator. That historical implementation is not evidence that the intended SWA/Function App broker exists today.

## Completion criteria

- Reuse the SWA frontend templates for both UI libraries and add portal-specific agent guidance.
- Scaffold a Function App with an explicit authenticated API contract and server-side Dataverse application-user configuration.
- Configure the linked backend trust boundary, tenant restrictions, and authenticated API routes. Linking an existing Function App currently requires SWA Standard; document deployment and preview-environment limitations.
- Supply local development setup, configuration examples without credentials, and deployment instructions for both resources.
- Test anonymous requests, spoofed identity headers, unauthorized operations/rows, allowed reads and writes, and Dataverse failures. Include frontend and broker build/lint checks in the generated matrix.
- Verify the actual deployed Entra-to-SWA-to-Function-to-Dataverse path.

## Licensing boundary

Application-user authentication is a supported technical connection pattern. It does not itself grant portal users a licensing entitlement or exempt indirect Dataverse access from multiplexing rules. Confirm the intended audience, applicable products/tables, and licensing arrangement, including the distinction between internal employees and external customers or partners, before claiming that unlicensed-user access is supported.

Use Microsoft's current [Power Platform licensing guidance](https://www.microsoft.com/licensing/guidance/Power-Platform) and [Dynamics 365 licensing guidance](https://www.microsoft.com/licensing/guidance/Dynamics-365) for that assessment. Keep the technical authentication design and the licensing conclusion separate.
