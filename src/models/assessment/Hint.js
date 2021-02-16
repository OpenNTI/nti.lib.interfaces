import { decorate } from '@nti/lib-commons';
import { mixin } from '@nti/lib-decorators';

import { Mixin as HasContent } from '../../mixins/HasContent';
import { model, COMMON_PREFIX } from '../Registry';
import Base from '../Base';

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

export default decorate(Hint, { with: [model, mixin(HasContent)] });
