export interface PowerPagesUser {
	userName: string;
	firstName?: string;
	lastName?: string;
}

declare global {
	interface Window {
		Microsoft?: {
			Dynamic365?: {
				Portal?: {
					User?: {
						userName?: string;
						firstName?: string;
						lastName?: string;
					};
				};
			};
		};
	}
}

export function getPowerPagesUser(): PowerPagesUser | null {
	const user = window.Microsoft?.Dynamic365?.Portal?.User;
	if (!user?.userName) return null;

	return {
		userName: user.userName,
		...(user.firstName !== undefined && { firstName: user.firstName }),
		...(user.lastName !== undefined && { lastName: user.lastName }),
	};
}

export async function getRequestVerificationToken(): Promise<string> {
	const response = await fetch("/_layout/tokenhtml", {
		credentials: "same-origin",
	});
	if (!response.ok) {
		const status = [response.status.toString(), response.statusText]
			.filter(Boolean)
			.join(" ");
		throw new Error(
			`Failed to get the Power Pages request verification token (${status}).`,
		);
	}

	const document = new DOMParser().parseFromString(await response.text(), "text/html");
	const token = document.querySelector<HTMLInputElement>(
		'input[name="__RequestVerificationToken"]',
	)?.value;
	if (!token) {
		throw new Error("Power Pages did not return a request verification token.");
	}

	return token;
}
