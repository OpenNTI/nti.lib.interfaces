import { Service } from '../../../constants.js';
import Registry, { COMMON_PREFIX } from '../../Registry.js';

import Assignment from './Assignment.js';

const secondsToMilliseconds = s => s * 1000;

export default class TimedAssignment extends Assignment {
	static MimeType = COMMON_PREFIX + 'assessment.timedassignment';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'IsTimedAssignment':  { type: 'boolean' },
		'maximum_time_allowed': { type: 'number', name: 'MaximumTimeAllowed' },
		'Metadata':           { type: 'object'  },
	};

	/**
	 *
	 * @param {Assignment} assignment
	 * @returns {TimedAssignment}
	 */
	static fromAssignment(assignment) {
		return new TimedAssignment(
			assignment[Service],
			assignment.parent(),
			assignment.__toRaw()
		);
	}

	isTimed = true;

	isNonSubmit() {
		return false;
	}

	isOverTime() {
		let max = this.getMaximumTimeAllowed();
		let dur = this.getDuration() || new Date() - this.getStartTime();
		return max < dur;
	}

	isStarted() {
		return !this.getLink('Commence');
	}

	start() {
		let link = this.getLink('Commence');

		if (!link) {
			return Promise.reject('No commence link');
		}

		return this[Service].post(link).then(() => this.refresh());
	}

	getDuration() {
		let md = this.Metadata;
		return md && secondsToMilliseconds(md.Duration);
	}

	getStartTime() {
		let md = this.Metadata;
		return md && md.StartTime;
	}

	getMaximumTimeAllowed() {
		return secondsToMilliseconds(this.MaximumTimeAllowed);
	}

	getTimeRemaining() {
		let now = new Date().getTime();
		let max = this.getMaximumTimeAllowed();
		let start = this.getStartTime();

		return !start ? max : max - (now - start);
	}
}

Registry.register(TimedAssignment);
