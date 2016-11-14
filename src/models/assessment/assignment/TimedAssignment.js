import {Service} from '../../../constants';
import Assignment from './Assignment';

const secondsToMilliseconds = s => s * 1000;

export default class TimedAssignment extends Assignment {
	constructor (service, parent, data) {
		super(service, parent, data);
		this.isTimed = true;

		// IsTimedAssignment
		// MaximumTimeAllowed

		// Metadata {
		//		Duration: int (seconds),
		//		StartTime: int (seconds)
		// }
	}


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
		return md && secondsToMilliseconds(md.Duration);
	}


	getStartTime () {
		let md = this.Metadata;
		return md && secondsToMilliseconds(md.StartTime);
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
