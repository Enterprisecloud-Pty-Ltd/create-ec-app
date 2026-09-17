const path = require("path");
const webpack = require("webpack");

const projectSrcPath = path.resolve(__dirname, "{{PROJECT_SRC_ALIAS}}");

module.exports = {
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "{{PROJECT_SRC_ALIAS}}"),
			"@progress/kendo-react-popup": path.resolve(
				projectSrcPath,
				"../node_modules/@progress/kendo-react-popup",
			),
			react: path.resolve(__dirname, "{{PROJECT_REACT_ALIAS}}"),
			"react-dom": path.resolve(__dirname, "{{PROJECT_REACT_DOM_ALIAS}}"),
			"@tanstack/react-query": path.resolve(
				projectSrcPath,
				"../node_modules/@tanstack/react-query",
			),
		},
	},
	plugins: [
		new webpack.NormalModuleReplacementPlugin(
			/AuthService/,
			(resource) => {
				const request = resource.request.replace(/\.[cm]?[jt]sx?$/, "");
				const requestedPath = request.startsWith("@/")
					? path.resolve(projectSrcPath, request.slice(2))
					: path.resolve(resource.context, request);
				if (requestedPath === path.join(projectSrcPath, "services", "AuthService")) {
					resource.request = path.resolve(__dirname, "runtime/pcfAuthService.ts");
				}
			},
		),
		new webpack.NormalModuleReplacementPlugin(
			/\.(css|scss|sass)$/,
			(resource) => {
				if (path.resolve(resource.context).startsWith(projectSrcPath)) {
					resource.request = path.resolve(__dirname, "runtime/emptyStyles.js");
				}
			},
		),
	],
};
