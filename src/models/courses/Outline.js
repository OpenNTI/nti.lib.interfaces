import { isEmpty, updateValue } from '@nti/lib-commons';

import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

import PageSource from './OutlineNodeBackedPageSource.js';

const INFLIGHT = Symbol('OutlineContents:RequestInflight');
const MAX_DEPTH = Symbol('OutlineContents:maximum depth');

function getMaxDepthFrom(n) {
	return (n.contents || [])
		.map(item => getMaxDepthFrom(item) + 1)
		.reduce((max, depth) => Math.max(max, depth), 0);
}

export default class Outline extends Base {
	static MimeType = COMMON_PREFIX + 'courses.courseoutline';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'ContentNTIID': { type: 'string'                      }
	}

	unpublished = false;

	/**
	 * Fill in the Outline Contents.
	 *
	 * @param {Object} [options] - An object of options
	 * @param {boolean} [options.force] - Force a new request, bypass & replace caches.
	 * @param {boolean} [options.unpublished] - include the unpublished nodes.
	 * @returns {Promise} fulfills with `this` instance, or rejects on error.
	 */
	getContent(options) {
		const { unpublished, force } = options || {};

		const changed = force || this.unpublished !== Boolean(unpublished);

		if (this.contents && !changed) {
			return Promise.resolve(this);
		}

		updateValue(this, 'unpublished', Boolean(unpublished));

		let promise = !changed ? this[INFLIGHT] : null;

		if (!promise) {
			promise = this.fetchLink({
				rel: 'contents',
				params: {
					omit_unpublished: !unpublished,
				},
			})
				.catch(() => []) //make errors return an empty outline
				.then(contents => {
					if (this[INFLIGHT] === promise) {
						updateValue(this, 'contents', contents);
						delete this[INFLIGHT];
					}
					return this;
				});

			this[INFLIGHT] = promise;
		}

		return promise;
	}

	get isNavigable() {
		return !isEmpty(this.href);
	}

	get isEmpty() {
		return isEmpty((this.label || '').trim()) && isEmpty(this.contents);
	}

	get label() {
		return '';
	}

	get maxDepth() {
		let d = (this[MAX_DEPTH] =
			this[MAX_DEPTH] || getMaxDepthFrom(this.root));
		return d;
	}

	get depth() {
		return 0;
	}

	get root() {
		return this;
	}

	getID() {
		return super.getID();
	}

	getContentId() {
		return this.ContentNTIID;
	}

	getNode(id) {
		if (this.getContentId() === id /* || this.getID() === id*/) {
			return this;
		}

		const { contents } = this;

		return !contents
			? null
			: contents.reduce(
					(item, potential) => item || potential.getNode(id),
					null
			  );
	}

	getPageSource() {
		let cache = Symbol.for('CachedPageSource');
		let root = this.root;
		if (!root[cache]) {
			root[cache] = new PageSource(root, this.root);
		}
		return root[cache];
	}

	getFlattenedList() {
		function flatten(node) {
			const fn =
				flatten.fnLoop ||
				(flatten.fnLoop = (a, n) => a.concat(flatten(n)));

			const { contents } = node;

			return [node].concat(!contents ? [] : contents.reduce(fn, []));
		}

		return flatten(this);
	}
}

Registry.register(Outline);
