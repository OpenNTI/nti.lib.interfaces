import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../../Registry';
import Part from '../Part';

class NumericMath extends Part {
	static MimeType = COMMON_PREFIX + 'assessment.numericmathpart'
}

export default decorate(NumericMath, {with:[model]});
