const path = require("path");
const webpack = require("webpack");

const projectSrcPath = path.resolve(__dirname, "{{PROJECT_SRC_ALIAS}}");

module.exports = {
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "{{PROJECT_SRC_ALIAS}}"),
			react: path.resolve(__dirname, "{{PROJECT_REACT_ALIAS}}"),
			"react-dom": path.resolve(__dirname, "{{PROJECT_REACT_DOM_ALIAS}}"),
		},
	},
	plugins: [
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
