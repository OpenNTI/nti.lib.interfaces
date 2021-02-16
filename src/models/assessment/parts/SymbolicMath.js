import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry';
import Part from '../Part';

class SymbolicMath extends Part {
	static MimeType = COMMON_PREFIX + 'assessment.symbolicmathpart';
}

export default decorate(SymbolicMath, { with: [model] });
