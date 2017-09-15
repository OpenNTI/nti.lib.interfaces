import {Service} from '../../../constants';
import {model, COMMON_PREFIX} from '../../Registry';

import Assignment from './Assignment';

const secondsToMilliseconds = s => s * 1000;

export default
@model
class TimedAssignment extends Assignment {
	static MimeType = COMMON_PREFIX + 'assessment.timedassignment'

	static Fields = {
		...Assignment.Fields,
		'IsTimedAssignment':  { type: 'boolean' },
		'MaximumTimeAllowed': { type: 'number'  },
		'Metadata':           { type: 'model'  },
	}

	isTimed = true


	isNonSubmit () {
		return false;
	}


	isOverTime () {
		let max = this.getMaximumTimeAllowed();
		let dur = this.getDuration() || (new Date() - this.getStartTime());
		return max < dur;
	}


	isStarted () {
		return !this.getLink('Commence');
	}


	start () {
		let link = this.getLink('Commence');

		if (!link) {
			return Promise.reject('No commence link');
		}

		return this[Service].post(link)
			.then(()=>this.refresh());
	}


	getDuration () {
		let md = this.Metadata;
		return md && secondsToMilliseconds(md.getDuration()); //convert in the model?
	}


	getStartTime () {
		let md = this.Metadata;
		return md && md.getStartTime();
	}


	getMaximumTimeAllowed () {
		return secondsToMilliseconds(this.MaximumTimeAllowed);
	}


	getTimeRemaining () {
		let now = new Date().getTime();
		let max = this.getMaximumTimeAllowed();
		let start = this.getStartTime();

		return !start ?
			max :
			(max - (now - start));
	}
}
