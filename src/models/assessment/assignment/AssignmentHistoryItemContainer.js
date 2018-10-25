import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
class AssignmentHistoryItemContainer extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.userscourseassignmenthistoryitemcontainer'

	static Fields = {
		...Base.Fields,
		'Items':                     { type: 'model{}'  }
	}

	getHistoryItem () {
		return this.Items && this.Items['UsersCourseAssignmentHistoryItem'];
	}
}
