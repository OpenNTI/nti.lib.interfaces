import isFunction from '../../utils/isfunction';
import * as MimeTypes from './MimeTypes';
import guid from '../../utils/guid';
import Heartbeat from './Heartbeat';

const StartTime = Symbol('StartTime');
const Finished = Symbol('Finished');
const MinDuration = Symbol('MinDuration');
const ID = Symbol('ID');
const Halted = Symbol('Halted');
const Heartbeat = Symbol('Heartbeat');

function durationSeconds(startTime = Date.now(), endTime = Date.now()) {
	return (endTime - startTime) / 1000;
}

let mimeTypes = MimeTypes.getTypes();

export default class BasicEvent {
	constructor (mimeType, courseId, RootContextID = courseId, startTime = Date.now(), minimumDurationSeconds = 1) {

		if (!mimeType || !mimeTypes[mimeType]) {
			console.warn('Unrecognized MimeType for analytics event: \'%s\'', mimeType);
		}

		this[StartTime] = startTime;
		this[Finished] = false;
		this[MinDuration] = minimumDurationSeconds;
		this[ID] = guid();
		this[Halted] = false;

		Object.assign(this, {
			MimeType: mimeType || MimeTypes.UNKNOWN_TYPE,
			RootContextID,
			course: courseId,
			lastBeat: Date.now(),
			timestamp: null
		});

		// updates an internal timestamp to provide an approximate end time for cases where
		// an instance didn't finish normally (as when retrieved from localStorage after the
		// app window was closed and re-opened later.
		this[Heartbeat] = new Heartbeat(this.onPulse.bind(this));

	}

	static halt(event) {
		event[Halted] = true;
		this.finish(event);
	}

	static finish(event, endTime = Date.now()) {
		if (event[Heartbeat]) {
			event[Heartbeat].die();
			delete event[Heartbeat];
		}

		if (event.finished) {
			console.warn('finish invoked on an already-finished analytics event. %O', event);
		}

		// If more than heartbeatInterval has passed between lastBeat and endTime, use lastBeat.
		// This provides a fairly accurate end time for cases where the browser/app was closed
		// and this event is being finished after the fact. (from localStorage).
		endTime = (endTime - Heartbeat.interval < event.lastBeat) ? endTime : event.lastBeat;
		//We don't control "time_length", disable the lint error...
		event.time_length = durationSeconds(event[StartTime], endTime);// eslint-disable-line camelcase
		event.timestamp = endTime / 1000; // the server is expecting seconds
		event[Finished] = true;
	}

	onPulse() {
		this.lastBeat = Date.now();
	}

	get id() {
		return this[ID];
	}

	get finished() {
		return this[Finished];
	}

	halt() {
		this.constructor.halt(this);
	}

	finish (endTime = Date.now()) {
		this.constructor.finish(this, endTime);
	}

	get startTime() {
		return this[StartTime];
	}

	setContextPath (path) {
		//We don't control the name "context_path"
		this.context_path = path; // eslint-disable-line camelcase
	}

	getDuration () {
		return this.finished ? this.time_length : durationSeconds(this[StartTime]);
	}

	getData () {
		let k, v, d = {};

		for (k in this) {
			if (!this.hasOwnProperty(k)) { continue; }
			v = this[k];
			if (v != null && !isFunction(v)) {

				if (v && isFunction(v.getData)) {
					v = v.getData();
				}

				d[k] = v;
			}
		}

		return d;
	}
}
