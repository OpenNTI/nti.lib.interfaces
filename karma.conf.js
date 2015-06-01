/*eslint no-var: 0, strict: 0*/
'use strict';
var webpack = require('webpack');

module.exports = function (config) {
	config.set({
		// basePath: '',
		frameworks: ['jasmine'],

		files: [
			'test/**/*.js',
			'**/__test__/*.spec.js'
		],

		preprocessors: {
			'test/**/*.js': ['webpack'],
			'**/__test__/*.spec.js': ['webpack', 'sourcemap']
		},

		// exclude: [],

		// port: 9876,
		logLevel: config.LOG_WARN,
		colors: true,
		autoWatch: false,
		browsers: ['PhantomJS'],


		//coverageReporter: { type: 'html', dir: 'reports/coverage/' },

		htmlReporter: {
			//templatePath: __dirname+'/jasmine_template.html',
			outputDir: 'reports/test-results'
		},

		junitReporter: {
			outputFile: 'reports/test-results.xml',
			suite: ''
		},


		// other possible values: 'dots', 'progress', 'junit', 'html', 'coverage'
		reporters: ['mocha'],
		captureTimeout: 60000,
		singleRun: true,


		webpackServer: {
			stats: {
				colors: true,
				reasons: true
			},
			quiet: true
		},

		webpack: {
			quiet: true,
			cache: true,
			debug: true,
			devtool: 'inline-source-map',


			node: {
				net: 'empty',
				tls: 'empty'
			},

			stats: {
				colors: true,
				reasons: true
			},
			target: 'web',



			resolve: {
				root: __dirname,
				extensions: ['', '.js']
			},

			plugins: [
				new webpack.DefinePlugin({
					SERVER: false
				})
			],

			module: {
				loaders: [
					{ test: /\.js(x)?$/, loader: 'babel', exclude: /node_modules/ },
					{ test: /\.json$/, loader: 'json' }
				]
			}
		}
	});
};
