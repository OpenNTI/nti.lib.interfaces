import isFunction from '../../utils/isfunction';
import noop from '../../utils/empty-function';

const Interval = Symbol();

/*
* Default interval if none is specified when instantiating a Heartbeat.
*/
const defaultInterval = 2000;

/**
* Pacemakers indexed by their timing/interval, e.g. {2000: pacemaker_instance, 5000: pacemaker_instance}
*/
let PacemakersByInterval = {};

/**
* @return The key for looking up a pacemaker in PacemakersByInterval
*/
function keyForPacemaker(interval) {
	return interval;
}

/**
* @return A Pacemaker instance for the given interval, instantiating one if necessary.
*/
function pacemakerForInterval(interval) {
	let key = keyForPacemaker(interval);
	if (!PacemakersByInterval[key]) {
		console.debug('new Pacemaker: interval: %d', interval);
		PacemakersByInterval[key] = new Pacemaker(interval);
	}
	return PacemakersByInterval[key];
}

/**
* Registers a heartbeat to receive callbacks at its interval.
*/
function add(heartbeat) {
	let pm = pacemakerForInterval(heartbeat.interval);
	pm.add(heartbeat);
}

/**
* Un-register the given heartbeat; Stop receiving callbacks.
*/
function remove(heartbeat) {
	let pm = pacemakerForInterval(heartbeat.interval);
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
		this.beats = new Set();
	}

	/**
	* Start sending periodic pulses to our Heartbeats.
	*/
	start() {
		this.intervalId = setInterval(this.pulse.bind(this), this.interval);
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
		this.beats.add(heartbeat);
		if (!this.running) {
			this.start();
		}
	}

	/**
	* Un-register the given heartbeat. Stops the Pacemaker if none remain.
	*/
	remove(heartbeat) {
		this.beats.delete(heartbeat);
		if (this.beats.size === 0) {
			this.stop();
		}
	}

	/**
	* Send a pulse to each registered Heartbeat.
	*/
	pulse() {
		this.beats.forEach(beat => {
			beat.onPulse();
		});
	}

	/**
	* @return the number of currently registered Heartbeats.
	*/
	get size() {
		return this.beats.size;
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
		this[Interval] = interval;
		this.callback = callback;
		add(this);
	}

	onPulse() {
		this.callback();
	}

	get interval() {
		return this[Interval];
	}

	die() {
		remove(this);
	}

}
