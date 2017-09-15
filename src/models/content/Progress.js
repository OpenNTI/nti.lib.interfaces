import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

const HasProgress = Symbol('Has Progress Field');
const ResourceID = Symbol('Resource ID Field');

export default
@model
class Progress extends Base {
	static MimeType = [
		COMMON_PREFIX + 'progress',
		COMMON_PREFIX + 'videoprogress',
	]

	static Fields = {
		...Base.Fields,
		'AbsoluteProgress':    { type: 'number'                     },
		'HasProgress':         { type: 'boolean', name: HasProgress },
		'MaxPossibleProgress': { type: 'number'                     },
		'ResourceID':          { type: 'string',  name: ResourceID  },
	}


	getProgress () {
		let {AbsoluteProgress, MaxPossibleProgress} = this;
		return AbsoluteProgress / (MaxPossibleProgress || 1);
	}


	hasCompleted () {
		let progress = (this.getProgress() || 0).toFixed(2);
		return progress === '1.00';
	}


	hasProgress () {
		return this[HasProgress];
	}


	getID () {
		return this[ResourceID];
	}
}
