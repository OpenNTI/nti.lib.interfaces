import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry';
import Part from '../Part';

class Math extends Part {
	static MimeType = COMMON_PREFIX + 'assessment.mathpart';
}

export default decorate(Math, { with: [model] });
