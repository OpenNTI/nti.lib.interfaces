import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
class AssignmentHistoryItemContainer extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.userscourseassignmenthistoryitemcontainer'

	static Fields = {
		...Base.Fields,
		'Items':                     { type: 'model[]'  }
	}

	getMostRecentHistoryItem () {
		return this.Items && this.Items[this.Items.length - 1];
	}
}
