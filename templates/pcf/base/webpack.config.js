const path = require("path");

module.exports = {
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "{{PROJECT_SRC_ALIAS}}"),
			react: path.resolve(__dirname, "{{PROJECT_REACT_ALIAS}}"),
			"react-dom": path.resolve(__dirname, "{{PROJECT_REACT_DOM_ALIAS}}"),
		},
	},
};
