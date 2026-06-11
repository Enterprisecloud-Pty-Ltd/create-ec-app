import React, { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "{{PROJECT_APP_IMPORT}}";
import "{{PROJECT_CSS_IMPORT}}";
import { PcfAppShell } from "./runtime/PcfAppShell";
import type { IInputs, IOutputs } from "./control/generated/ManifestTypes";
import type {
	PcfRuntimeContext,
	PcfWebApi,
} from "{{PROJECT_RUNTIME_TYPES_IMPORT}}";

function sanitizeGuid(value: string | null | undefined): string | null {
	if (!value) return null;
	return value.replace(/[{}]/g, "");
}

function getPageClientUrl(
	pageContext:
		| {
				clientUrl?: unknown;
				getClientUrl?: unknown;
		  }
		| undefined,
): string | null {
	const getClientUrl = pageContext?.getClientUrl;
	if (typeof getClientUrl === "function") {
		try {
			const clientUrl = getClientUrl.call(pageContext);
			return typeof clientUrl === "string" ? clientUrl : null;
		} catch {
			return null;
		}
	}

	return typeof pageContext?.clientUrl === "string"
		? pageContext.clientUrl
		: null;
}

function getContextInfo(context: ComponentFramework.Context<IInputs>) {
	const pageContext = (
		context as ComponentFramework.Context<IInputs> & {
			page?: {
				clientUrl?: unknown;
				entityId?: string;
				entityTypeName?: string;
				getClientUrl?: unknown;
			};
		}
	).page;

	const modeContextInfo = (
		context.mode as ComponentFramework.Mode & {
			contextInfo?: { entityId?: string; entityTypeName?: string };
		}
	).contextInfo;

	return {
		recordId: sanitizeGuid(
			modeContextInfo?.entityId ?? pageContext?.entityId ?? null,
		),
		entityName:
			modeContextInfo?.entityTypeName ?? pageContext?.entityTypeName ?? null,
		clientUrl: getPageClientUrl(pageContext),
		userId: sanitizeGuid(context.userSettings.userId),
	};
}

function createPcfWebApi(
	context: ComponentFramework.Context<IInputs>,
): PcfWebApi {
	return {
		async retrieve<T>(entitySet: string, id: string, query = ""): Promise<T> {
			return (await context.webAPI.retrieveRecord(
				entitySet,
				id,
				query,
			)) as T;
		},
		async retrieveMultiple<T>(entitySet: string, query = ""): Promise<T[]> {
			const response = await context.webAPI.retrieveMultipleRecords(
				entitySet,
				query,
			);
			return response.entities as T[];
		},
		async create<T>(entitySet: string, data: unknown): Promise<T> {
			return (await context.webAPI.createRecord(
				entitySet,
				data as ComponentFramework.WebApi.Entity,
			)) as T;
		},
		async update(entitySet: string, id: string, data: unknown): Promise<void> {
			await context.webAPI.updateRecord(
				entitySet,
				id,
				data as ComponentFramework.WebApi.Entity,
			);
		},
	};
}

function createRuntime(
	context: ComponentFramework.Context<IInputs>,
): PcfRuntimeContext {
	return {
		host: "pcf",
		...getContextInfo(context),
		webApi: createPcfWebApi(context),
	};
}

export class {{PCF_CONSTRUCTOR}}
	implements ComponentFramework.StandardControl<IInputs, IOutputs>
{
	private root: Root | null = null;
	private runtime!: PcfRuntimeContext;
	private readonly queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				refetchOnWindowFocus: false,
				retry: 3,
				staleTime: 5 * 60 * 1000,
			},
			mutations: {
				retry: 1,
			},
		},
	});

	public init(
		context: ComponentFramework.Context<IInputs>,
		_notifyOutputChanged: () => void,
		_state: ComponentFramework.Dictionary,
		container: HTMLDivElement,
	): void {
		container.classList.add("pcf-shell-control");
		container.dataset.pcfControl = "{{PCF_CONSTRUCTOR}}";
		this.runtime = createRuntime(context);
		this.root = createRoot(container);
		this.render();
	}

	public updateView(context: ComponentFramework.Context<IInputs>): void {
		this.runtime = {
			...this.runtime,
			...getContextInfo(context),
		};
		this.render();
	}

	public getOutputs(): IOutputs {
		return {
			hostField: this.runtime.recordId ?? undefined,
		};
	}

	public destroy(): void {
		this.root?.unmount();
		this.root = null;
	}

	private render(): void {
		this.root?.render(
			React.createElement(
				StrictMode,
				null,
				React.createElement(
					PcfAppShell,
					null,
					React.createElement(
						QueryClientProvider,
						{ client: this.queryClient },
						React.createElement(App, { runtime: this.runtime }),
					),
				),
			),
		);
	}
}
