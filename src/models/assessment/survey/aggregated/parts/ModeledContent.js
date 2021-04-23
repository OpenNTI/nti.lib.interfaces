import { decorate } from '@nti/lib-commons';

// import {Parser as parse} from '../../../../../constants.js';
import { model, COMMON_PREFIX } from '../../../../Registry.js';

import Base from './Part.js';

class AggregatedModeledContentPart extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.aggregatedmodeledcontentpart';

	getResults() {
		return this.Results;
	}
}

export default decorate(AggregatedModeledContentPart, [model]);
