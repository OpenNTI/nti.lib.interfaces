import {updateValue, defineProtected} from 'nti-commons';

import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

import PageSource from './OutlineNodeBackedPageSource';

const INFLIGHT = Symbol('OutlineContents:RequestInflight');
const MAX_DEPTH = Symbol('OutlineContents:maximum depth');

function getMaxDepthFrom (n) {
	return (n.contents || [])
		.map(item => getMaxDepthFrom(item) + 1)
		.reduce((max, depth) => Math.max(max, depth), 0);
}

@model
export default class Outline extends Base {
	static MimeType = COMMON_PREFIX + 'courses.courseoutline'

	constructor (service, parent, data, ...mixins) {
		super(service, parent, data, ...mixins);
		Object.defineProperties(this, {

			...defineProtected({
				contents: null,
				unpublished: false
			})
		});
	}


	/**
	 * Fill in the Outline Contents.
	 *
	 * @param {object} [options] - An object of options
	 * @param {boolean} [options.force] - Force a new request, bypass & replace caches.
	 * @param {boolean} [options.unpublished] - include the unpublished nodes.
	 * @returns {Promise} fulfills with `this` instance, or rejects on error.
	 */
	getContent (options) {
		const {unpublished, force} = options || {};

		const changed = force || this.unpublished !== Boolean(unpublished);

		if (this.contents && !changed) {
			return Promise.resolve(this);
		}

		updateValue(this, 'unpublished', Boolean(unpublished));

		let promise = !changed ? this[INFLIGHT] : null;

		if (!promise) {
			promise = this.fetchLinkParsed('contents', { 'omit_unpublished' : !unpublished })
				.catch(() => [])//make errors return an empty outline
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


	get isNavigable () {
		return (this.href || '').length > 0;
	}


	get isEmpty () {
		return (this.label || '').trim().length === 0 &&
				this.contents.length === 0;
	}


	get label () { return ''; }


	get maxDepth () {
		let d = this[MAX_DEPTH] = (this[MAX_DEPTH] || getMaxDepthFrom(this.root));
		return d;
	}


	get depth () { return 0; }


	get root () { return this; }


	getID () {
		console.error('Do you really want the OutlineNode\'s ID or its Content ID?'); //eslint-disable-line no-console
		return super.getID();
	}


	getContentId () {
		return this.ContentNTIID;
	}


	getNode (id) {
		if (this.getContentId() === id/* || this.getID() === id*/) {
			return this;
		}

		return this.contents.reduce((item, potential) => item || potential.getNode(id), null);
	}


	getPageSource () {
		let cache = Symbol.for('CachedPageSource');
		let root = this.root;
		if (!root[cache]) {
			root[cache] = new PageSource(root, this.root);
		}
		return root[cache];
	}


	getFlattenedList () {
		function flatten (node) {
			const fn = flatten.fnLoop ||
				(flatten.fnLoop = (a, n)=> a.concat(flatten(n)));

			return [node].concat(node.contents.reduce(fn, []));
		}

		return flatten(this);
	}
}
