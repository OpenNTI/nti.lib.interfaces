import Base from '../Base';
import {
	Parser as parse
} from '../../CommonSymbols';

const TakeOver = Symbol.for('TakeOver');

export default class GradeBookUserSummary extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);
		const rename = (x, y) => this[TakeOver](x, y);

		this[parse]('HistoryItemSummary');
		this[parse]('User');

		rename('User', 'user');
		rename('Username', 'username');
	}

	get completed () {
		const {HistoryItemSummary: item} = this;
		return item ? item.getSubmissionCreatedTime() : null;
	}


	get feedbackCount () {
		const {HistoryItemSummary: item} = this;
		const {FeedbackCount: count} = item || {};
		return count;

	}


	get grade () {
		const {HistoryItemSummary: item} = this;
		const {grade} = item || {};
		return grade;
	}
}
