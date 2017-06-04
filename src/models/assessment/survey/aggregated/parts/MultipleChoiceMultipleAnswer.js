// import {Parser as parse} from '../../../../../constants';
import {model, COMMON_PREFIX} from '../../../../Registry';

import Base from './MultipleChoice';

@model
export default class AggregatedMultipleChoiceMultipleAnswerPart extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.aggregatedmultiplechoicemultipleanswerpart'

	constructor (service, parent, data) {
		super(service, parent, data);
	}

}
