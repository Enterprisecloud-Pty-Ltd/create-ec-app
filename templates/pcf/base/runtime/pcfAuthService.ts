const unsupported = (): never => {
	throw new Error(
		"Webresource authentication is unavailable in the PCF host. Use the runtime webApi passed to App.",
	);
};

export const getApiUrl = unsupported;
export const getAuthHeaders = async (): Promise<never> => unsupported();
