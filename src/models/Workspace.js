import Registry, { COMMON_PREFIX } from './Registry.js';
import Base from './Model.js';
import Collection from './WorkspaceCollection.js';

export default class Workspace extends Base {
	static MimeType = COMMON_PREFIX + 'workspace';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Items': { type: Collection.List },
		'Title': { type: 'string'        },
	};

	constructor(...args) {
		super(...args);

		/** @type {Collection[]} */
		this.Items;
		/** @type {string} */
		this.Title;
	}

	getCollection(title) {
		return (this.Items || []).find(c => c.Title === title);
	}
}

Registry.register(Workspace);
