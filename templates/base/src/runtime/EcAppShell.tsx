import * as React from "react";

const EcPortalContainerContext = React.createContext<HTMLElement | null>(null);

export function useEcPortalContainer() {
	return React.useContext(EcPortalContainerContext);
}

export function EcAppShell({ children }: { children: React.ReactNode }) {
	const [portalContainer, setPortalContainer] =
		React.useState<HTMLDivElement | null>(null);

	return (
		<div data-ec-app-root="">
			<EcPortalContainerContext.Provider value={portalContainer}>
				{children}
				<div data-ec-portal-root="" ref={setPortalContainer} />
			</EcPortalContainerContext.Provider>
		</div>
	);
}
