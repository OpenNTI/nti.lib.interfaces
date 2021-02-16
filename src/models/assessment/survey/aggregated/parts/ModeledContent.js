import { decorate } from '@nti/lib-commons';

// import {Parser as parse} from '../../../../../constants';
import { model, COMMON_PREFIX } from '../../../../Registry';

import Base from './Part';

class AggregatedModeledContentPart extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.aggregatedmodeledcontentpart';

	getResults() {
		return this.Results;
	}
}

export default decorate(AggregatedModeledContentPart, { with: [model] });
