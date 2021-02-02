import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

class Webinar extends Base {
	static MimeType = COMMON_PREFIX + 'webinar'

	static Fields = {
		...Base.Fields,
		'description':         { type: 'string'  },
		'inSession':           { type: 'boolean' },
		'numberOfRegistrants': { type: 'number'  },
		'organizerKey':        { type: 'string'  },
		'registrationUrl':     { type: 'string'  },
		'subject':             { type: 'string'  },
		'timezone':            { type: 'string'  },
		'times':               { type: 'model[]' },
		'webinarID':           { type: 'string'  },
		'webinarKey':          { type: 'string'  }
	}


	/**
	 * Returns the duration of the nearest session (based on either a given time or nearest from now)
	 *
	 * @param  {Object} dateOrTime (Optional) Specifies a time on which to base the nearest session.  Now if unspecified
	 * @returns {number}            Milliseconds representing duration of the webinar session
	 */
	getDuration (dateOrTime) {
		const nearestSession = this.getNearestSession(dateOrTime);

		if(!nearestSession) {
			return 0;
		}

		return nearestSession.getEndTime() - nearestSession.getStartTime();
	}


	/**
	 * Returns the next session from a given time (or the current time if no time is given).  If there are no upcoming
	 * sessions, return the most recent session.
	 *
	 * @param  {Date|number} date  Can be either a Date or a time in ms
	 * @returns {Object}            WebinarSession object (with startTime/endTime)
	 */
	getNearestSession (date = Date.now()) {
		const {times} = this;

		if(!times || times.length === 0) {
			return null;
		}


		let latestPast = null;
		let current = null;
		let nextUp = null;

		for (let session of times) {
			const startTime = session.getStartTime();
			const endTime = session.getEndTime();

			if(date >= startTime && date < endTime) {
				current = session;
			}
			else if(date > startTime) {
				// if this session was in the past, see if it's closer to date than other past sessions
				if(latestPast == null || latestPast.getStartTime() < startTime) {
					latestPast = session;
				}
			}
			else {
				// if this session is in the future, see if it's closer to date than other future sessions
				if(nextUp == null || nextUp.getStartTime() > startTime) {
					nextUp = session;
				}
			}
		}

		// if there is an upcoming session, return that, otherwise fallback to the most recent past session
		return current || nextUp || latestPast;
	}


	isJoinable (date = Date.now()) {
		return !this.isExpired(date) && this.hasLink('JoinWebinar');
	}


	isAvailable (date = Date.now()) {
		return (x => x && x.getStartTime() <= date && x.getEndTime() >= date)(this.getNearestSession(date));
	}


	isExpired (date = Date.now()) {
		return (x => !x || (x.getStartTime() <= date && x.getEndTime() <= date))(this.getNearestSession(date));
	}
}

export default decorate(Webinar, {with:[model]});
