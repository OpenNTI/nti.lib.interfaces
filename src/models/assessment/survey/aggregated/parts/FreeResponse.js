// import {Parser as parse} from '../../../../../constants';
import {model, COMMON_PREFIX} from '../../../../Registry';

import Base from './Part';

@model
export default class AggregatedFreeResponsePart extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.aggregatedfreeresponsepart'

	constructor (service, parent, data) {
		super(service, parent, data);
	}


	getResults () {
		return this.Results;
	}
}
