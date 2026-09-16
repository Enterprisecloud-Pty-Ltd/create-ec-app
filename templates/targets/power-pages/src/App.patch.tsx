import { getPowerPagesUser } from "./powerPages";

function App() {
	const user = getPowerPagesUser();
	const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

	return (
		<div className="flex h-screen flex-col items-center justify-center gap-4">
			<p>Power Pages SPA ready.</p>
			{user && <p>Signed in as {displayName || user.userName}.</p>}
		</div>
	);
}

export default App;
