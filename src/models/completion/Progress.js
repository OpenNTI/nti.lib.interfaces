import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

const HasCompleted = Symbol('Has Completed Field');
const HasProgress = Symbol('Has Progress Field');
const ResourceID = Symbol('Resource ID Field');

class Progress extends Base {
	static MimeType = [
		COMMON_PREFIX + 'progress',
		COMMON_PREFIX + 'videoprogress',
		COMMON_PREFIX + 'completion.progress',
	];

	// prettier-ignore
	static Fields = {
		'AbsoluteProgress':    { type: 'number'                      },
		'Completed':           { type: 'boolean', name: HasCompleted },
		'CompletedDate':       { type: 'date'                        },
		'HasProgress':         { type: 'boolean', name: HasProgress  },
		'MaxPossibleProgress': { type: 'number'                      },
		'ResourceID':          { type: 'string',  name: ResourceID   },
	}

	getCompletedDate() {} //implemented by CompletedDate date field.

	getProgress() {
		const { AbsoluteProgress, MaxPossibleProgress } = this;
		return (AbsoluteProgress || 0) / (MaxPossibleProgress || 1);
	}

	hasCompleted() {
		return (
			this[HasCompleted] ||
			'1.00' === (this.getProgress() || 0).toFixed(2)
		);
	}

	hasProgress() {
		return this[HasProgress];
	}

	getID() {
		return this[ResourceID] || super.getID();
	}
}

export default decorate(Progress, { with: [model] });
