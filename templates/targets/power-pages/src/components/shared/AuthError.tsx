import { useAuth } from "@/context/useAuth";

export function AuthError() {
	const { error, clearError } = useAuth();

	if (!error) {
		return null;
	}

	return (
		<div role="alert" className="rounded border p-3">
			<p>Authentication error: {error}</p>
			<button type="button" onClick={clearError}>
				Dismiss
			</button>
		</div>
	);
}
