import { mixin as HasContent } from '../../mixins/HasContent.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

export default class Hint extends HasContent(Base) {
	static MimeType = [
		COMMON_PREFIX + 'assessment.hint',
		COMMON_PREFIX + 'assessment.htmlhint',
		COMMON_PREFIX + 'assessment.texthint',
	];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'value': { type: 'string', content: true },
	};
}

Registry.register(Hint);
