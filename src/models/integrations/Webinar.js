import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class Webinar extends Base {
	static MimeType = COMMON_PREFIX + 'webinar'

	static Fields = {
		...Base.Fields,
		'description':         { type: 'string'  },
		'inSession':           { type: 'boolean' },
		'numberOfRegistrants': { type: 'number'  },
		'organizerKey':        { type: 'number'  },
		'registrationUrl':     { type: 'string'  },
		'subject':             { type: 'string'  },
		'timezone':            { type: 'string'  },
		'times':               { type: 'model[]' },
		'webinarID':           { type: 'string'  },
		'webinarKey':          { type: 'number'  }
	}

	/**
	 * Returns the next session from a given time (or the current time if no time is given).  If there are no upcoming
	 * sessions, return the most recent session.
	 *
	 * @param  {object} dateOrTime Can be either a Date object or a time in ms
	 * @return {object}            WebinarSession object (with startTime/endTime)
	 */
	getNearestSession (dateOrTime) {
		const {times} = this;

		if(!times || times.length === 0) {
			return null;
		}

		const now = (dateOrTime && dateOrTime.getTime && dateOrTime.getTime()) || dateOrTime || Date.now();

		let latestPast = null;
		let nextUp = null;

		times.forEach(session => {
			const startTime = session.getStartTime().getTime();

			if(now > startTime) {
				// if this session was in the past, see if it's closer to now than other past sessions
				if(latestPast == null || latestPast.getStartTime().getTime() < startTime) {
					latestPast = session;
				}
			}
			else {
				// if this session is in the future, see if it's closer to now than other future sessions
				if(nextUp == null || nextUp.getStartTime().getTime() > startTime) {
					nextUp = session;
				}
			}
		});

		// if there is an upcoming session, return that, otherwise fallback to the most recent past session
		return nextUp || latestPast;
	}
}
