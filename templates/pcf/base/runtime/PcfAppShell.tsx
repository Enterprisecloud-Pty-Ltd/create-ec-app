import * as React from "react";
{{PCF_KENDO_POPUP_IMPORT}}

import { PortalContainerContext } from "{{PROJECT_PORTAL_CONTAINER_IMPORT}}";

export function PcfAppShell({ children }: { children: React.ReactNode }) {
	const [portalContainer, setPortalContainer] =
		React.useState<HTMLDivElement | null>(null);

	return (
		<div data-pcf-app-root="">
			<PortalContainerContext.Provider value={portalContainer}>
				{{PCF_KENDO_POPUP_PROVIDER_OPEN}}
				{children}
				<div data-pcf-portal-root="" ref={setPortalContainer} />
				{{PCF_KENDO_POPUP_PROVIDER_CLOSE}}
			</PortalContainerContext.Provider>
		</div>
	);
}
