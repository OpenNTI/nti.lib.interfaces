import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry';
import Base from '../Base';

class Solution extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.solution';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'value':                    { type: '*' }	// solution values can be various types
	};
}

export default decorate(Solution, { with: [model] });
