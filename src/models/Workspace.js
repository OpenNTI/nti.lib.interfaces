import Registry, { COMMON_PREFIX } from './Registry.js';
import Base from './Base.js';
import Collection from './WorkspaceCollection.js';

export default class Workspace extends Base {
	static MimeType = COMMON_PREFIX + 'workspace';

	// prettier-ignore
	static Fields = {
		//...super.Fields,
		'Items': { type: Collection.List },
		'Links': { type: '*'             },
		'Title': { type: 'string'        },
	}

	getCollection(title) {
		return (this.Items || []).find(c => c.Title === title);
	}
}

Registry.register(Workspace);
