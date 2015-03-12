import define from '../../utils/object-define-properties';
import fixRefs from '../../utils/rebase-references';
import clean from '../../utils/sanitize-markup';

function cleanupContentString(content) {
	try {
		let root = this.getContentRoot();
		content = fixRefs(content, root);
	} catch (e) {
		console.error('Content cannot be rooted. %s', e.stack || e.message || e);
	}

	return clean(content);
}

function setup (data, keys) {
	let props = {};
	let clean = cleanupContentString.bind(this);

	for(let key of keys) {
		let content = data[key] || '';
		props[key] = {
			enumerable: true,
			configurable: true,
			get () {

				if (Array.isArray(content)) {
					content = content.map(clean);
				} else {
					content = clean(content);
				}

				//re-define the getter
				delete this[key];
				this[key] = content;

				return content;
			}
		};
	}

	define(this, props);
}

export const ContentKeys = Symbol('ContentKeys');
export const SetupContentProperties = Symbol('SetupContentProperties');

export default {

	constructor (data) {
		let keys = this[ContentKeys] &&
		 			this[ContentKeys]();

		if (keys === undefined) {
			keys = ['content'];
		}

		this[SetupContentProperties] = setup;

		this[SetupContentProperties](data, keys);
	},


	getContentRoot () {
		return this.ContentRoot || this.parent('getContentRoot').getContentRoot();
	}
};
