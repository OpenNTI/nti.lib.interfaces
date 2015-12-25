import logger from 'debug';
import browser from './utils/browser';

const pattern = logger.load() || ['info', 'error', 'warn'].map(x => `*:${x}`).join(',');
logger.enable(pattern);

const COLORS = {
	'error': browser ? 'crimson' : 1, //red
	'info': browser ? 'forestgreen' : 2, //green
	'warn': browser ? 'goldenrod' : 3, //yellow/orange
	'debug': browser ? 'dodgerblue' : 4 //blue
	//'': browser ? 'darkorchid' : 5, //magenta
	//'': browser ? 'lightseagreen' : 6, //lightblue
};

export default class Logger {

	static get (name) {
		const cache = this.loggers = this.loggers || {};

		if (!cache[name]) {
			cache[name] = new Logger(name);
		}

		return cache[name];
	}

	static quiet () {
		logger.disable();
	}


	constructor (name) {
		for (let key of ['info', 'error', 'warn', 'debug']) {
			this[key] = logger(`${name}:${key}`);
			this[key].color = COLORS[key];
		}

		if (browser) {
			this.error.log = console.error.bind(console);
			this.warn.log = console.warn.bind(console);
			this.debug.log = console.debug.bind(console);
		}

		this.name = name;
		this.log = this.info;
	}
}
