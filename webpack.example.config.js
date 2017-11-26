const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const PRODUCTION = process.env.NODE_ENV === 'production'

const plugins = [
	new HtmlWebpackPlugin({ template: './src/example/index.html' }),
	new webpack.DefinePlugin({
		'process.env': {
			NODE_ENV: JSON.stringify(process.env.NODE_ENV)
		}
	})
]

if (PRODUCTION) plugins.push(new webpack.optimize.UglifyJsPlugin())

module.exports = {
	entry: './src/example/index.js',
	output: {
		path: path.resolve('./build'),
		filename: 'bundle.js',
		publicPath: '/'
	},
	plugins,
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: [/node_modules/],
				loader: 'babel-loader',
				options: {
					presets: ['env', 'stage-0', 'react']
				}
			}
		]
	},
	devtool: PRODUCTION ? undefined : 'cheap-module-source-map',
	devServer: {
		port: 1337,
		historyApiFallback: true,
		host: '0.0.0.0'
	}
}
