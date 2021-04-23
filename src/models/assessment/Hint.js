import { decorate } from '@nti/lib-commons';
import { mixin } from '@nti/lib-decorators';

import { Mixin as HasContent } from '../../mixins/HasContent.js';
import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class Hint extends Base {
	static MimeType = [
		COMMON_PREFIX + 'assessment.hint',
		COMMON_PREFIX + 'assessment.htmlhint',
		COMMON_PREFIX + 'assessment.texthint',
	];

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'value': { type: 'string', content: true },
	}
}

export default decorate(Hint, [model, mixin(HasContent)]);
