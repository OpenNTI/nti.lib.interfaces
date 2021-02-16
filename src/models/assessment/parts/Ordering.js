import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry';
import Part from '../Part';

class Ordering extends Part {
	static MimeType = COMMON_PREFIX + 'assessment.orderingpart';

	// prettier-ignore
	static Fields = {
		...Part.Fields,
		'labels': { type: 'string[]', content: true },
		'values': { type: 'string[]', content: true },
	}

	isAnswered() {
		return true;
	}

	getInitialValue() {
		return { ...(this.labels || []).map((_, i) => i) };
	}
}

export default decorate(Ordering, { with: [model] });
