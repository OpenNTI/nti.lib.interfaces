import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from './Registry';
import Base from './Base';
import Collection from './WorkspaceCollection';

class Workspace extends Base {
	static MimeType = COMMON_PREFIX + 'workspace';

	// prettier-ignore
	static Fields = {
		'Items': { type: Collection.List },
		'Links': { type: '*'             },
		'Title': { type: 'string'        },
	}

	getCollection(title) {
		return (this.Items || []).find(c => c.Title === title);
	}
}

export default decorate(Workspace, { with: [model] });
