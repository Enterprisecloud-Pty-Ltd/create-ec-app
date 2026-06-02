import * as React from "react";

export const EC_APP_SCOPE_CLASS = "ec-app";
export const EC_APP_ID = "{{APP_NAME}}";
export const EC_PCF_SCOPE_CLASS = "ec-pcf-shell-control";

const EcPortalContainerContext = React.createContext<HTMLElement | null>(null);

export function useEcPortalContainer() {
	return React.useContext(EcPortalContainerContext);
}

export function EcAppShell({ children }: { children: React.ReactNode }) {
	const [portalContainer, setPortalContainer] =
		React.useState<HTMLDivElement | null>(null);

	return (
		<div
			className={EC_APP_SCOPE_CLASS}
			data-ec-app-id={EC_APP_ID}
			data-ec-app-root=""
		>
			<EcPortalContainerContext.Provider value={portalContainer}>
				{children}
				<div data-ec-portal-root="" ref={setPortalContainer} />
			</EcPortalContainerContext.Provider>
		</div>
	);
}
