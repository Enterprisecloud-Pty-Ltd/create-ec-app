import { createContext, useContext } from "react";

export interface AADUserInfo {
	userName?: string;
	profile?: Record<string, unknown>;
	idToken?: string;
	displayableId?: string;
	name?: string;
	givenName?: string;
	familyName?: string;
	username?: string;
}

interface AuthContextType {
	isAuthenticated: boolean;
	user: AADUserInfo | null;
	login: () => Promise<void> | void;
	logout: () => void;
	error: string | null;
	clearError: () => void;
	getIdToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
