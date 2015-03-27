import isFunction from '../../utils/isfunction';
import noop from '../../utils/empty-function';

/*
* Default interval if none is specified when instantiating a Heartbeat.
*/
const defaultInterval = 2000;

/**
* Pacemakers indexed by their timing/interval, e.g. {2000: pacemaker_instance, 5000: pacemaker_instance}
*/
let _pacemakersByInterval = {};

/**
* @return The key for looking up a pacemaker in _pacemakersByInterval
*/
function keyForPacemaker(interval) {
	return interval;
}

/**
* @return A Pacemaker instance for the given interval, instantiating one if necessary.
*/
function _pacemakerForInterval(interval) {
	let key = keyForPacemaker(interval);
	if (!_pacemakersByInterval[key]) {
		console.debug('new Pacemaker: interval: %d', interval);
		_pacemakersByInterval[key] = new Pacemaker(interval);
	}
	return _pacemakersByInterval[key];
} 

/**
* Registers a heartbeat to receive callbacks at its interval.
*/
function add(heartbeat) {
	let pm = _pacemakerForInterval(heartbeat.interval);
	pm.add(heartbeat);
}

/**
* Un-register the given heartbeat; Stop receiving callbacks.
*/
function remove(heartbeat) {
	let pm = _pacemakerForInterval(heartbeat.interval);
	pm.remove(heartbeat);
}

/**
* Keeps track of added Heartbeat instances and calls their onPulse method
* at the specified interval. This allows us to handle multiple heartbeats
* with a single setInterval call.
*/
class Pacemaker {

	/**
	* Construct a new instance to invoke Heartbeat callbacks at the given interval.
	*/
	constructor(pulseInterval) {
		if (typeof pulseInterval !== 'number') {
			throw new Error('pulseInterval argument must be a number.');
		}
		if (pulseInterval < defaultInterval) {
			console.warn('Creating a Pacemaker with a fast interval (%d).', pulseInterval);
		}
		this.interval = pulseInterval;
		this._beats = new Set();
	}

	/**
	* Start sending periodic pulses to our Heartbeats.
	*/
	start() {
		this.intervalId = setInterval(this._pulse.bind(this), this.interval);
	}

	/**
	* Stop sending pulses to our Heartbeats.
	*/
	stop() {
		clearInterval(this.intervalId);
		delete this.intervalId;
	}

	/**
	* Currently running/sending periodic pulses?
	*/
	get running() {
		return !!this.intervalId;
	}

	/**
	* Register a Heartbeat to receive periodic pulses.
	*/
	add(heartbeat) {
		this._beats.add(heartbeat);
		if (!this.running) {
			this.start();
		}  
	}

	/**
	* Un-register the given heartbeat. Stops the Pacemaker if none remain.
	*/
	remove(heartbeat) {
		this._beats.delete(heartbeat);
		if (this._beats.size === 0) {
			this.stop();
		}
	}

	/**
	* Send a pulse to each registered Heartbeat.
	*/
	_pulse() {
		this._beats.forEach(beat => {
			beat.onPulse();
		});
	}

	/**
	* @return the number of currently registered Heartbeats.
	*/
	get size() {
		return this._beats.size;
	}

}

/**
* Encapsulates a callback function and an interval, to be registered with a Pacemaker instance
* who will invoke onPulse at the given interval.
*/
export default class Heartbeat {

	constructor(callback, interval=defaultInterval) {
		if (!isFunction(callback)) {
			console.error('Callback must be a function. %o', callback);
			callback = noop;
		}
		this._interval = interval;
		this._callback = callback;
		add(this);
	}

	onPulse() {
		this._callback();
	}

	get interval() {
		return this._interval;
	}

	die() {
		remove(this);
	}
	
}
