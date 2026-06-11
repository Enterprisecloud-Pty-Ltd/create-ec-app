import * as React from "react";

import { PortalContainerContext } from "{{PROJECT_PORTAL_CONTAINER_IMPORT}}";

export function PcfAppShell({ children }: { children: React.ReactNode }) {
	const [portalContainer, setPortalContainer] =
		React.useState<HTMLDivElement | null>(null);

	return (
		<div data-pcf-app-root="">
			<PortalContainerContext.Provider value={portalContainer}>
				{children}
				<div data-pcf-portal-root="" ref={setPortalContainer} />
			</PortalContainerContext.Provider>
		</div>
	);
}
