import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';

class SCORMReference extends Base {
	static MimeType = [COMMON_PREFIX + 'scormcontentref'];

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'title':            { type: 'string' },
		'description':      { type: 'string' },
		'icon':             { type: 'string' },
		'target':           { type: 'string' },
		'ScormContentInfo': {type: 'model' }
	}

	get CompletedItem() {
		return this.ScormContentInfo?.CompletedItem;
	}
	set CompletedItem(item) {
		if (this.ScormContentInfo) {
			this.ScormContentInfo.CompletedItem = item;
		}
	}

	isCompletable(...args) {
		return this.ScormContentInfo
			? this.ScormContentInfo.isCompletable(...args)
			: null;
	}
	getCompletedDate(...args) {
		return this.ScormContentInfo
			? this.ScormContentInfo.getCompletedDate(...args)
			: null;
	}
	hasCompleted(...args) {
		return this.ScormContentInfo
			? this.ScormContentInfo.hasCompleted(...args)
			: null;
	}
	updateCompletedState(...args) {
		return this.ScormContentInfo
			? this.ScormContentInfo.updateCompletedState(...args)
			: null;
	}
	completedSuccessfully(...args) {
		return this.ScormContentInfo
			? this.ScormContentInfo.completedSuccessfully(...args)
			: null;
	}
	completedUnsuccessfully(...args) {
		return this.ScormContentInfo
			? this.ScormContentInfo.completedUnsuccessfully(...args)
			: null;
	}
}

export default decorate(SCORMReference, [model]);
