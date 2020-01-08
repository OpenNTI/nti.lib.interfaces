import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
class SCORMReference extends Base {
	static MimeType = [
		COMMON_PREFIX + 'scormcontentref'
	]

	static Fields = {
		...Base.Fields,
		'title':            { type: 'string' },
		'description':      { type: 'string' },
		'icon':             { type: 'string' },
		'target':           { type: 'string' },
		'ScormContentInfo': {type: 'model' }
	}

	getCompletedDate (...args) { return this.ScormContentInfo ? this.ScormContentInfo.getCompletedDate(...args) : null; }
	hasCompleted (...args) { return this.ScormContentInfo ? this.ScormContentInfo.hasCompleted(...args) : null; }
	updateCompletedState (...args) { return this.ScormContentInfo ? this.ScormContentInfo.updateCompletedState(...args) : null; }
	completedSuccessfully (...args) { return this.ScormContentInfo ? this.ScormContentInfo.completedSuccessfully(...args) : null; }
	completedUnsuccessfully (...args) { return this.ScormContentInfo ? this.ScormContentInfo.completedUnsuccessfully(...args) : null; }
}