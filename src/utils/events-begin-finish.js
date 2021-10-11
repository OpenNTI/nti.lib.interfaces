import { EVENT_BEGIN, EVENT_FINISH } from '../constants.js';

/** @typedef {import("events").EventEmitter} EventEmitter */

/**
 * Fire a EVENT_BEGIN on the emitter.
 *
 * @param  {EventEmitter} emitter - The emitter to fire the event on.
 * @param  {*} action - Any value to identify what is beginning.
 * @returns {void}
 */
export const begin = (emitter, action) => (
	emitter.emit(EVENT_BEGIN, action), void 0
);

/**
 * Fire a EVENT_FINISH on the emitter.
 *
 * @param  {EventEmitter} emitter - The emitter to fire the event on.
 * @param  {*} action - Any value to identify what is finishing.
 * @param  {*} data - Any value to passed for data.
 * @param  {*} [e] - Some error value.
 * @returns {void|Promise} If error is supplied, will return a rejected Promise (rejected with the error) - so that
 * we can use this as a catch callback, and not swallow the rejection.
 */
export const finish = (emitter, action, data, e) => (
	emitter.emit(EVENT_FINISH, action, data, e), e ? Promise.reject(e) : void e
);

/**
 * Utility to make success and rejection callbacks for 'finish'.
 *
 * @param  {EventEmitter} emitter - The emitter to fire the event on.
 * @param  {*} action - Any value to identify what is finishing.
 * @param  {*} data - Any value to passed for data.
 * @returns {Array} Two callbacks to be applied/spread on a Promise@then()
 */
export const finishers = (emitter, action, data) => [
	response => finish(emitter, action, { response, ...data }),
	e => finish(emitter, action, data, e),
];
