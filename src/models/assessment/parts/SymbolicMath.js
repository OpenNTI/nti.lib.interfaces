import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry.js';
import Part from '../Part.js';

class SymbolicMath extends Part {
	static MimeType = COMMON_PREFIX + 'assessment.symbolicmathpart';
}

export default decorate(SymbolicMath, [model]);
