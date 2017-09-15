import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';


export default
@model
class GradeBookUserSummary extends Base {
	static MimeType = [
		COMMON_PREFIX + 'gradebook.userassignmentsummary',
		COMMON_PREFIX + 'gradebook.usergradebooksummary'
	]

	static Fields = {
		...Base.Fields,
		'Alias':                   { type: 'string', name: 'displayName' },
		'HistoryItemSummary':      { type: 'model'                       },
		'OverdueAssignmentCount':  { type: 'string', name: 'overdue'     },
		'UngradedAssignmentCount': { type: 'string', name: 'ungraded'    },
		'User':                    { type: 'model',  name: 'user'        },
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
