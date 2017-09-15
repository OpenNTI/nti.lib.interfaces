import {Markup} from 'nti-commons';
import isEmpty from 'isempty';

function cleanupContentString (content) {
	try {
		let root = this.getContentRoot() || '/content/missing-root/';
		content = Markup.rebaseReferences(content, root);
	} catch (e) {
		console.error('Content cannot be rooted. %s', e.stack || e.message || e); //eslint-disable-line no-console
	}

	return Markup.sanitize(content);
}

function setup (data, keys) {
	let filter = cleanupContentString.bind(this);

	let buildProperty = key => {
		let content = data[key] || '';
		Object.defineProperty(this, key, {
			enumerable: true,
			configurable: true,
			get () {

				if (Array.isArray(content)) {
					content = content.map(filter);
				} else {
					content = filter(content);
				}

				//re-define the getter
				delete this[key];
				this[key] = content;

				return content;
			}
		});
	};

	for(let key of keys) {
		buildProperty(key);
	}
}

export const SetupContentProperties = Symbol('SetupContentProperties');

export const Mixin = {

	constructor (data) {
		const {constructor: Type} = this;
		const {Fields = {}} = Type;

		let keys = Object.keys(Fields).filter(x => Fields[x].content);

		if (isEmpty(keys)) {
			keys = ['content'];
		}

		this[SetupContentProperties] = setup;

		this[SetupContentProperties](data, keys);
	},


	getContentRoot () {
		const findRootValue  = x => (x = this.parent('ContentRoot'), x && x.ContentRoot);
		const findRootGetter = x => (x = this.parent('getContentRoot'), x && x.getContentRoot());

		return this.ContentRoot || findRootValue() || findRootGetter();
	}
};
