const baseConfig = require('gnoll/config/babel')

module.exports = {
	...baseConfig,
	presets: [
		require('gnoll/config/babelStage0.js')
	]
}
