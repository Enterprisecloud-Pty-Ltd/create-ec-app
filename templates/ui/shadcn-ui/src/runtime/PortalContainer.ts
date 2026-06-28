import * as React from "react";

export const PortalContainerContext =
	React.createContext<HTMLElement | null>(null);

export function usePortalContainer() {
	return React.useContext(PortalContainerContext);
}
