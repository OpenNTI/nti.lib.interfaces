import { decorate } from '@nti/lib-commons';

import { Parent, Service } from '../constants.js';

import { model, COMMON_PREFIX } from './Registry.js';
import Base from './Base.js';

class Change extends Base {
	static MimeType = COMMON_PREFIX + 'change';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'Item': { type: 'model' }
	}

	static wrap(thing) {
		if (!(thing instanceof Base)) {
			throw new Error('Argument must be a model instance');
		}

		const copy = (from, ...keys) =>
			keys.reduce((o, key) => ((o[key] = from[key]), o), {});

		const change = new Change(thing[Service], thing[Parent], {
			MimeType: Change.MimeType,
			...copy(thing.toJSON(), 'creator', 'CreatedTime', 'Last Modified'),
		});

		change.Item = thing;

		return change;
	}
}

export default decorate(Change, [model]);
