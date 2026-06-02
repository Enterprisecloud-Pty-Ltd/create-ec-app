import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./index.css";
import App from "./App.tsx";
import { EcAppShell } from "./runtime/EcAppShell.tsx";

const queryClient = new QueryClient({
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
});

const root = createRoot(document.getElementById("root")!);

root.render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<EcAppShell>
				<App />
			</EcAppShell>
		</QueryClientProvider>
	</StrictMode>
);
