import Base from '../Base';
import {
	Parser as parse
} from '../../CommonSymbols';

const RENAME = Symbol.for('TakeOver');

export default class GradeBookUserSummary extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);

		this[parse]('HistoryItemSummary');
		this[parse]('User');

		this[RENAME]('User', 'user');
		this[RENAME]('Username', 'username');
		this[RENAME]('Alias', 'displayName');


		this[RENAME]('OverdueAssignmentCount', 'overdue');
		this[RENAME]('UngradedAssignmentCount', 'ungraded');
	}


	get completed () {
		const {HistoryItemSummary: item} = this;
		return item ? item.getSubmissionCreatedTime() : null;
	}


	get feedbackCount () {
		const {HistoryItemSummary: {FeedbackCount: count} = {}} = this;
		return count;
	}


	get grade () {
		const {HistoryItemSummary: {grade} = {}} = this;
		return grade;
	}
}
