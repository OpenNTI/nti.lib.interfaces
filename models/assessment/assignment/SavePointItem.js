import Base from '../../Base';
import {
	Parser as parse
} from '../../../CommonSymbols';

export default class SavePointItem extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);

		this[parse]('Submission');
	}


	getQuestions () {
		return this.Submission ? this.Submission.getQuestions() : [];
	}

	isSubmitted () { return false; }

}
