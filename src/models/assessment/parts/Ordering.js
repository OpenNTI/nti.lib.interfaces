import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Part from '../Part.js';

export default class Ordering extends Part {
	static MimeType = COMMON_PREFIX + 'assessment.orderingpart';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'labels': { type: 'string[]', content: true },
		'values': { type: 'string[]', content: true },
	};

	isAnswered() {
		return true;
	}

	getInitialValue() {
		return { ...(this.labels || []).map((_, i) => i) };
	}
}

Registry.register(Ordering);
