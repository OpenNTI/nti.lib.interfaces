import isFunction from '../../utils/isfunction';
import noop from '../../utils/empty-function';

const defaultInterval = 2000;
let _beats = new Set();
let intervalId;

function add(heartbeat) {
	_beats.add(heartbeat);
	if (!intervalId) {
		intervalId = setInterval(pulse, defaultInterval);
	}
}

function remove(heartbeat) {
	_beats.delete(heartbeat);
	if (_beats.size === 0) {
		clearInterval(intervalId);
		intervalId = null;
	}
}

function pulse() {
	_beats.forEach(beat => {
		beat.onPulse();
	});
}

export default class Heartbeat {

	static get interval() {
		return defaultInterval;
	}

	constructor(callback) {
		if (!isFunction(callback)) {
			console.error('Callback must be a function. %o', callback);
			callback = noop;
		}
		this._callback = callback;
		add(this);
	}

	onPulse() {
		this._callback();
	}

	die() {
		remove(this);
	}
	
}

