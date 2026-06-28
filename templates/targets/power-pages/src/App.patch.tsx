import { useAuth } from "./context/AuthContext";
import { AuthError } from "./components/shared/AuthError";

function App() {
	const { isAuthenticated } = useAuth();

	return (
		<div className="flex h-screen flex-col items-center justify-center gap-4">
			<AuthError />
			{isAuthenticated ? (
				<div>You are logged in</div>
			) : (
				<div>Please Log In</div>
			)}
		</div>
	);
}

export default App;
