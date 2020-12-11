import {decorate} from '@nti/lib-commons';

import {
	Parent,
	Service,
} from '../constants';

import {model, COMMON_PREFIX} from './Registry';
import Base from './Base';

class Change extends Base {
	static MimeType = COMMON_PREFIX + 'change'

	static Fields = {
		...Base.Fields,
		'Item': { type: 'model' }
	}

	static wrap (thing) {
		if (!(thing instanceof Base)) {
			throw new Error('Argument must be a model instance');
		}

		const copy = (from, ...keys) => keys.reduce((o, key) => (o[key] = from[key], o), {});


		const change = new Change(thing[Service], thing[Parent], {
			MimeType: Change.MimeType,
			...copy(thing.toJSON(), 'creator', 'CreatedTime', 'Last Modified'),
		});

		change.Item = thing;

		return change;
	}
}

export default decorate(Change, { with: [model]});
