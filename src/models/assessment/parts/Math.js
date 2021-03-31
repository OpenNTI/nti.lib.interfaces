import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry.js';
import Part from '../Part.js';

class Math extends Part {
	static MimeType = COMMON_PREFIX + 'assessment.mathpart';
}

export default decorate(Math, { with: [model] });
