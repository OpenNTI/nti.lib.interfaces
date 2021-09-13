import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';

export default class SCORMReference extends Base {
	static MimeType = [COMMON_PREFIX + 'scormcontentref'];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'title':              { type: 'string' },
		'description':        { type: 'string' },
		'icon':               { type: 'string' },
		'target':             { type: 'string' },
		'ScormContentInfo':   { type: 'model' },
		'CompletionRequired': { type: 'boolean' },
		'CompletedItem':      { type: 'model' },
		'Target-NTIID':       { type: 'string' },
	}

	get CompletedItem() {
		return this.ScormContentInfo?.CompletedItem;
	}
	set CompletedItem(item) {
		if (this.ScormContentInfo) {
			this.ScormContentInfo.CompletedItem = item;
		}
	}

	get isScormRef() {
		return true;
	}

	isCompletable(...args) {
		return this.ScormContentInfo?.isCompletable(...args) ?? null;
	}
	getCompletedDate(...args) {
		return this.ScormContentInfo?.getCompletedDate(...args) ?? null;
	}
	hasCompleted(...args) {
		return this.ScormContentInfo?.hasCompleted(...args) ?? null;
	}
	updateCompletedState(...args) {
		return this.ScormContentInfo?.updateCompletedState(...args) ?? null;
	}
	completedSuccessfully(...args) {
		return this.ScormContentInfo?.completedSuccessfully(...args) ?? null;
	}
	completedUnsuccessfully(...args) {
		return this.ScormContentInfo?.completedUnsuccessfully(...args) ?? null;
	}
}

Registry.register(SCORMReference);
