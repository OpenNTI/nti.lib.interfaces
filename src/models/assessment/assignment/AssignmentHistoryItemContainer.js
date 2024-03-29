import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Model.js';

export default class AssignmentHistoryItemContainer extends Base {
	static MimeType =
		COMMON_PREFIX + 'assessment.userscourseassignmenthistoryitemcontainer';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Items':                     { type: 'model[]'  }
	};

	getMostRecentHistoryItem() {
		return this.Items?.[this.Items.length - 1];
	}
}

Registry.register(AssignmentHistoryItemContainer);
