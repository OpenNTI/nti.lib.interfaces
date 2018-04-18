import {mixin} from '@nti/lib-decorators';

import {Service} from '../../constants';
import Submission from '../../mixins/Submission';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
@mixin(Submission)
class QuestionSubmission extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.questionsubmission'

	static Fields = {
		...Base.Fields,
		'questionId':                    { type: 'string'  },
		'parts':                         { type: '*' },
		'ContainerId':                   { type: 'string'  },
		'CreatorRecordedEffortDuration': { type: 'number'  },
	}

	static build (question) {
		const {parts} = question;
		const data = {
			MimeType: QuestionSubmission.MimeType,
			ContainerId: question.containerId,
			NTIID: question.getID(),
			questionId: question.getID(),
			parts: parts && parts.map(p => p.getInitialValue ? p.getInitialValue() : null)
		};

		return new this(question[Service], question, data);
	}


	getID () {
		return this.NTIID || this.questionId;
	}


	getPartValue (index) {
		return this.parts[index];
	}


	setPartValue (index, value) {
		index = parseInt(index, 10);
		if (index < 0 || index >= (this.parts || []).length) {
			throw new Error('Index Out Of Bounds.');
		}

		this.parts[index] = value;
	}


	addRecordedEffortTime (/*duration*/) {
		// let old = this.CreatorRecordedEffortDuration || 0;
		// this.CreatorRecordedEffortDuration = old + duration;

		//Force/Blank this out for now.
		this.CreatorRecordedEffortDuration = null;
	}


	canSubmit () {
		const answered = p => p !== null;

		if (this.isSubmitted()) { return false; }

		return (this.parts || []).filter(answered).length > 0;
	}
}
