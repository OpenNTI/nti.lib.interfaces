// import {Parser as parse} from '../../../../../constants.js';
import Registry, { COMMON_PREFIX } from '../../../../Registry.js';

import Base from './Part.js';

export default class AggregatedFreeResponsePart extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.aggregatedfreeresponsepart';

	getResults() {
		return this.Results;
	}
}

Registry.register(AggregatedFreeResponsePart);
