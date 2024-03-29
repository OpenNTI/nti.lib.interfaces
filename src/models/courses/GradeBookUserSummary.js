import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

export default class GradeBookUserSummary extends Base {
	static MimeType = [
		COMMON_PREFIX + 'gradebook.userassignmentsummary',
		COMMON_PREFIX + 'gradebook.usergradebooksummary',
	];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Alias':                   { type: 'string', name: 'displayName' },
		'HistoryItemSummary':      { type: 'model'                       },
		'OverdueAssignmentCount':  { type: 'number?', name: 'overdue'    },
		'UngradedAssignmentCount': { type: 'number?', name: 'ungraded'   },
		'User':                    { type: 'model',  name: 'user'        },
		'AvailableFinalGrade':     { type: 'boolean'                     }
	};

	get username() {
		return this.user.getID();
	}

	get completed() {
		const { HistoryItemSummary: item } = this;
		return item ? item.completed : null;
	}

	get feedbackCount() {
		const { HistoryItemSummary: { FeedbackCount: count } = {} } = this;
		return count;
	}

	get grade() {
		const { HistoryItemSummary: { grade } = {} } = this;
		return grade;
	}

	get hasFinalGrade() {
		return this.AvailableFinalGrade;
	}
}

Registry.register(GradeBookUserSummary);
