import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry';
import Base from '../../Base';

class AssignmentHistoryItemContainer extends Base {
	static MimeType =
		COMMON_PREFIX + 'assessment.userscourseassignmenthistoryitemcontainer';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'Items':                     { type: 'model[]'  }
	}

	getMostRecentHistoryItem() {
		return this.Items && this.Items[this.Items.length - 1];
	}
}

export default decorate(AssignmentHistoryItemContainer, { with: [model] });
