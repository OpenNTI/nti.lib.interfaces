import {Service} from '../Base';
import Assignment from './Assignment';


export default class TimedAssignment extends Assignment {
	constructor(service, parent, data) {
		this.isTimed = true;
		super(service, parent, data);

		// IsTimedAssignment
		// MaximumTimeAllowed

		// Metadata {
		//		Duration: int (seconds),
		//		StartTime: int (seconds)
		// }

		this.MaximumTimeAllowed *= 1000;

		if (this.Metadata) {
			this.Metadata.Duration *= 1000;
			this.Metadata.StartTime *= 1000;
		}
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
		return md && md.Duration;
	}


	getStartTime () {
		let md = this.Metadata;
		return md && md.StartTime;
	}


	getMaximumTimeAllowed () {
		return this.MaximumTimeAllowed;
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
