import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from './Registry.js';
import Base from './Base.js';
import Collection from './WorkspaceCollection.js';

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

export default decorate(Workspace, [model]);
