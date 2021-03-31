import { decorate } from '@nti/lib-commons';

// import {Parser as parse} from '../../../../../constants.js';
import { model, COMMON_PREFIX } from '../../../../Registry.js';

import Base from './Part.js';

class AggregatedFreeResponsePart extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.aggregatedfreeresponsepart';

	getResults() {
		return this.Results;
	}
}

export default decorate(AggregatedFreeResponsePart, { with: [model] });
