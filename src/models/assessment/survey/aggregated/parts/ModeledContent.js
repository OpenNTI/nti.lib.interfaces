// import {Parser as parse} from '../../../../../constants';
import {model, COMMON_PREFIX} from '../../../../Registry';

import Base from './Part';

@model
export default class AggregatedModeledContentPart extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.aggregatedmodeledcontentpart'

	constructor (service, parent, data) {
		super(service, parent, data);
	}


	getResults () {
		const {Results: results} = this;
		return results;
	}
}
