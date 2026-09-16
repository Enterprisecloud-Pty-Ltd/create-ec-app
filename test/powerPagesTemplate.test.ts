import { afterEach, describe, expect, it, vi } from "vitest";
import {
	getPowerPagesUser,
	getRequestVerificationToken,
} from "../templates/targets/power-pages/src/powerPages.js";

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("Power Pages template runtime", () => {
	it("returns null for an anonymous hosted session", () => {
		vi.stubGlobal("window", { Microsoft: { Dynamic365: { Portal: { User: {} } } } });

		expect(getPowerPagesUser()).toBeNull();
	});

	it("maps an authenticated hosted user", () => {
		vi.stubGlobal("window", {
			Microsoft: {
				Dynamic365: {
					Portal: {
						User: {
							userName: "alex@example.com",
							firstName: "Alex",
							lastName: "Smith",
						},
					},
				},
			},
		});

		expect(getPowerPagesUser()).toEqual({
			userName: "alex@example.com",
			firstName: "Alex",
			lastName: "Smith",
		});
	});

	it("reads the request verification token", async () => {
		vi.stubGlobal(
			"DOMParser",
			class {
				parseFromString() {
					return {
						querySelector: () => ({ value: "token-123" }),
					};
				}
			},
		);
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(
				'<input type="hidden" name="__RequestVerificationToken" value="token-123" />',
			),
		);
		vi.stubGlobal("fetch", fetchMock);

		await expect(getRequestVerificationToken()).resolves.toBe("token-123");
		expect(fetchMock).toHaveBeenCalledWith("/_layout/tokenhtml", {
			credentials: "same-origin",
		});
	});

	it("reports a failed token request", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(new Response("denied", { status: 403 })),
		);

		await expect(getRequestVerificationToken()).rejects.toThrow(
			"Failed to get the Power Pages request verification token (403).",
		);
	});

	it("reports a token response without the required input", async () => {
		vi.stubGlobal(
			"DOMParser",
			class {
				parseFromString() {
					return { querySelector: () => null };
				}
			},
		);
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html></html>")));

		await expect(getRequestVerificationToken()).rejects.toThrow(
			"Power Pages did not return a request verification token.",
		);
	});
});
