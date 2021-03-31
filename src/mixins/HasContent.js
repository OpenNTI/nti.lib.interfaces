import { isEmpty, Markup } from '@nti/lib-commons';

import { getPropertyDescriptor } from '../utils/get-property-descriptor.js';

function cleanupContentString(content) {
	try {
		let root = this.getContentRoot() || '/content/missing-root/';
		content = Markup.rebaseReferences(content, root);
	} catch (e) {
		//eslint-disable-next-line no-console
		console.error(
			'Content cannot be rooted. %s',
			e.stack || e.message || e
		);
	}

	return Markup.sanitize(content);
}

function setup(data, keys) {
	let filter = cleanupContentString.bind(this);

	let buildProperty = key => {
		const descriptor = getPropertyDescriptor(this, key);
		let content = data[key] || '';
		function filterContent() {
			if (filterContent.cached) {
				return filterContent.cached;
			}

			if (Array.isArray(content)) {
				content = content.map(filter);
			} else {
				content = filter(content);
			}

			filterContent.cached = content;

			return content;
		}

		Object.defineProperty(this, key, {
			...descriptor,
			enumerable: true,
			configurable: false,
			get: Object.assign(filterContent, { declared: true }),
			set:
				descriptor && !descriptor.set
					? undefined
					: x => {
							delete filterContent.cached;
							content = x;
							return descriptor.set?.call?.(this, x);
					  },
		});
	};

	for (let key of keys) {
		buildProperty(key);
	}
}

export const SetupContentProperties = Symbol('SetupContentProperties');

export const Mixin = {
	initMixin(data) {
		const { constructor: Type } = this;
		const { Fields = {} } = Type;

		let keys = Object.keys(Fields).filter(x => Fields[x].content);

		if (isEmpty(keys)) {
			keys = ['content'];
		}

		this[SetupContentProperties] = setup;

		this[SetupContentProperties](data, keys);
	},

	getContentRoot() {
		const findRootValue = x => (
			(x = this.parent('ContentRoot')), x && x.ContentRoot
		);
		const findRootGetter = x => (
			(x = this.parent('getContentRoot')), x && x.getContentRoot()
		);

		return this.ContentRoot || findRootValue() || findRootGetter();
	},
};
