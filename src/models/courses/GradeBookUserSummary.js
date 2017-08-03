import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';
import {
	Parser as parse
} from '../../constants';

const RENAME = Symbol.for('TakeOver');

export default
@model
class GradeBookUserSummary extends Base {
	static MimeType = [
		COMMON_PREFIX + 'gradebook.userassignmentsummary',
		COMMON_PREFIX + 'gradebook.usergradebooksummary'
	]

	constructor (service, parent, data) {
		super(service, parent, data);

		this[parse]('HistoryItemSummary');
		this[parse]('User');

		this[RENAME]('User', 'user');
		this[RENAME]('Alias', 'displayName');


		this[RENAME]('OverdueAssignmentCount', 'overdue');
		this[RENAME]('UngradedAssignmentCount', 'ungraded');
	}


	get username () {
		return this.user.getID();
	}


	get completed () {
		const {HistoryItemSummary: item} = this;
		return item ? item.completed : null;
	}


	get feedbackCount () {
		const {HistoryItemSummary: {FeedbackCount: count} = {}} = this;
		return count;
	}


	get grade () {
		const {HistoryItemSummary: {grade} = {}} = this;
		return grade;
	}


	get hasFinalGrade () {
		return this.AvailableFinalGrade;
	}
}
