import { useAuth } from "./context/AuthContext";

function App() {
	const { isAuthenticated, user } = useAuth(); //INFO: User is where the token information is stored (user?.idToken)

	return (
		<div className="flex h-screen flex-col items-center justify-center gap-4">
			{isAuthenticated ? (
				<div>You are logged in</div>
			) : (
				<div>Please Log In</div>
			)}
		</div>
	);
}

export default App;
