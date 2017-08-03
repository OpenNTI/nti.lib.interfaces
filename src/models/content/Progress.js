import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

const HIDDEN = Symbol('Protected Data');

export default
@model
class Progress extends Base {
	static MimeType = [
		COMMON_PREFIX + 'progress',
		COMMON_PREFIX + 'videoprogress',
	]

	constructor (service, parent, data) {
		super(service, parent, data);

		//Relevant keys:
		//
		//	HasProgress
		//	AbsoluteProgress
		//	MaxPossibleProgress
		//	ResourceID

		//super class applies the keys of data directly onto `this`,
		//lets keep that data "private-ish"
		delete this.HasProgress;
		delete this.AbsoluteProgress;
		delete this.MaxPossibleProgress;

		this[HIDDEN] = data;
	}


	getProgress () {
		let {AbsoluteProgress, MaxPossibleProgress} = this[HIDDEN];
		return AbsoluteProgress / (MaxPossibleProgress || 1);
	}


	hasCompleted () {
		let progress = (this.getProgress() || 0).toFixed(2);
		return progress === '1.00';
	}


	hasProgress () {
		let data = this[HIDDEN];
		return data.HasProgress;
	}


	getID () {
		return this.ResourceID;
	}
}
