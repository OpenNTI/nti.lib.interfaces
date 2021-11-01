// import {model, COMMON_PREFIX} from './Registry.js';
import Base from './Base.js';
import Registry, { COMMON_PREFIX } from './Registry.js';

export default class WorkspaceCollection extends Base {
	static MimeType = COMMON_PREFIX + 'workspace.collection';

	static computeMimeType = title =>
		COMMON_PREFIX + `__internal__.${title?.toLowerCase()}`;

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'accepts': { type: 'string[]' },
		'Items':   { type: 'model[]'  },
		'Title':   { type: 'string'   },
	};

	static List = (service, parent, items) => {
		if (!Array.isArray(items)) {
			throw new TypeError('Invalid input, `items` sould be an array.');
		}

		return items.map(data => {
			const Cls =
				Registry.lookup(this.computeMimeType(data.Title)) ||
				WorkspaceCollection;

			return new Cls(service, parent, data);
		});
	};

	constructor(...args) {
		super(...args);

		/** @type {string[]} */
		this.accepts;
		/** @type {Base[]} */
		this.Items;
		/** @type {string} */
		this.Title;
	}

	acceptsType(mime) {
		return this.accepts.includes(mime);
	}

	async fetch(force) {
		if (this.Items && !force) {
			return this;
		}

		await this.refresh();

		return this;
	}
}

Registry.register(WorkspaceCollection);
Registry.alias('workspace.collection', 'collection');
