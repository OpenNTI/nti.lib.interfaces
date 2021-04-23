import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry.js';
import Part from '../Part.js';

class Matching extends Part {
	static MimeType = COMMON_PREFIX + 'assessment.matchingpart';

	// prettier-ignore
	static Fields = {
		...Part.Fields,
		'values': { type: 'string[]', content: true },
		'labels': { type: 'string[]', content: true },
	}

	isAnswered(partValue) {
		let maybe = !!partValue;
		let { length } = this.values;

		for (let i = 0; maybe && i < length; i++) {
			//all values have to be non-nully
			maybe = maybe && partValue[i] != null;
		}

		return maybe;
	}
}

export default decorate(Matching, [model]);
