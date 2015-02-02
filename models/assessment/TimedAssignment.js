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
		var max = this.getMaximumTimeAllowed();
		var dur = this.getDuration() || (new Date() - this.getStartTime());
		return max < dur;
	}


	isStarted () {
		return !this.getLink('Commence');
	}


	start () {
		var link = this.getLink('Commence');

		if (!link) {
			return Promise.reject('No commence link');
		}

		return this[Service].post(link)
			.then(()=>this.refresh());
	}


	getDuration () {
		var md = this.Metadata;
		return md && md.Duration;
	}


	getStartTime () {
		var md = this.Metadata;
		return md && md.StartTime;
	}


	getMaximumTimeAllowed () {
		return this.MaximumTimeAllowed;
	}


	getTimeRemaining () {
		var now = new Date().getTime();
		var max = this.getMaximumTimeAllowed();
		var start = this.getStartTime();

		return  !start ?
					max :
					(max - (now - start));
	}
}
