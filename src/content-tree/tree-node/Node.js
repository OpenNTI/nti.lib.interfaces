import { Array as arr } from '@nti/lib-commons';

import { Walker as TreeWalker } from '../tree-walker/index.js';
import { ERRORS } from '../constants.js';
import { deferredValue } from '../utils/index.js';

import {
	filter,
	findNextSibling,
	findPrevSibling,
	find,
	findParent,
	findParentOrSelf,
	flatten,
} from './utils/index.js';

const ITEM = Symbol('Item');
const PARENT = Symbol('Parent');

const CHILDREN = Symbol('Children');
const CLONES = Symbol('Clones');
const RESOLVE_CHILDREN = Symbol('Resolve Children');
const MUTATE_CHILDREN_AND_CLONE = Symbol('Create Clone');

function getItem(item, clones) {
	if (clones) {
		return async () => {
			const node = await clones.resolve();

			if (!node) {
				return null;
			}

			return node.getItem();
		};
	}

	return item;
}

function getParent(parent, clones) {
	if (clones) {
		return async () => {
			const node = await clones.resolve();

			if (!node) {
				return null;
			}

			return node.getParentNode();
		};
	}

	return parent;
}

function getChildren(children, clones, config) {
	if (config[CHILDREN]) {
		return config[CHILDREN];
	}

	if (clones) {
		return async () => {
			const node = await clones.resolve();

			if (!node) {
				return null;
			}

			return node.getChildNodes();
		};
	}

	return children;
}

export default class ContentTreeNode {
	constructor(item, parent, config = {}) {
		this[CLONES] = config[CLONES] && deferredValue(config[CLONES]);

		this[ITEM] = deferredValue(getItem(item, this[CLONES], config));

		this[PARENT] = deferredValue(getParent(parent, this[CLONES], config));

		this[CHILDREN] = deferredValue(
			getChildren(() => this[RESOLVE_CHILDREN](), this[CLONES], config)
		);
	}

	async isEmptyNode() {
		const item = await this.getItem();

		return !item;
	}

	async resolve() {
		const isEmpty = await this.isEmpty();
		const item = await this.getItem();
		const parentNode = await this.getParentNode();
		const childNodes = await this.getChildNodes();

		return {
			isEmpty,
			item,
			parentNode,
			childNodes,
		};
	}

	async getItem() {
		return await this[ITEM].resolve();
	}

	async getParentNode() {
		return await this[PARENT].resolve();
	}

	async getChildNodes() {
		return this[CHILDREN].resolve();
	}

	async [RESOLVE_CHILDREN]() {
		const empty = await this.isEmptyNode();

		if (empty) {
			return null;
		}

		const item = await this.getItem();
		const parent = await this.getParentNode();

		if (!item || !item.getContentTreeChildrenSource) {
			return null;
		}

		const children = await item.getContentTreeChildrenSource(parent);

		return arr
			.ensure(children)
			.map(child => new ContentTreeNode(child, this));
	}

	[MUTATE_CHILDREN_AND_CLONE](children) {
		return new ContentTreeNode(null, null, {
			[CHILDREN]: children,
			[CLONES]: this,
		});
	}

	filter(filterFn) {
		ERRORS.throwIfNotFunction(
			filterFn,
			ERRORS.getMessage('filter must be given a function.')
		);

		const filtered = async () => {
			const children = await this.getChildNodes();

			return filter(children, filterFn, true);
		};

		return this[MUTATE_CHILDREN_AND_CLONE](filtered);
	}

	filterChildren(filterFn) {
		ERRORS.throwIfNotFunction(
			filterFn,
			ERRORS.getMessage('filter must be given a function.')
		);

		const filtered = async () => {
			const children = await this.getChildNodes();

			return filter(children, filterFn);
		};

		return this[MUTATE_CHILDREN_AND_CLONE](filtered);
	}

	flatten() {
		const flattened = async () => {
			const children = await this.getChildNodes();

			return flatten(children);
		};

		return this[MUTATE_CHILDREN_AND_CLONE](flattened);
	}

	find(predicate) {
		ERRORS.throwIfNotFunction(
			predicate,
			ERRORS.getMessage('find must be given a function')
		);

		const clone = async () => {
			const children = await this.getChildNodes();

			return find(children, predicate, true);
		};

		return new ContentTreeNode(null, null, { [CLONES]: clone });
	}

	findChild(predicate) {
		ERRORS.throwIfNotFunction(
			predicate,
			ERRORS.getMessage('findChild must be given a function')
		);

		const clone = async () => {
			const children = await this.getChildNodes();

			return find(children, predicate);
		};

		return new ContentTreeNode(null, null, { [CLONES]: clone });
	}

	findParent(predicate) {
		ERRORS.throwIfNotFunction(
			predicate,
			ERRORS.getMessage('findParent must be given a function')
		);

		const clone = async () => {
			return findParent(this, predicate);
		};

		return new ContentTreeNode(null, null, { [CLONES]: clone });
	}

	findParentOrSelf(predicate) {
		ERRORS.throwIfNotFunction(
			predicate,
			ERRORS.getMessage('findParentOrSelf must be given a function')
		);

		const clone = async () => {
			return findParentOrSelf(this, predicate);
		};

		return new ContentTreeNode(null, null, { [CLONES]: clone });
	}

	findNextSibling() {
		const clone = async () => {
			return findNextSibling(this);
		};

		return new ContentTreeNode(null, null, { [CLONES]: clone });
	}

	findPrevSibling() {
		const clone = async () => {
			return findPrevSibling(this);
		};

		return new ContentTreeNode(null, null, { [CLONES]: clone });
	}

	createTreeWalker(root, config) {
		//If we're passed config as the only argument
		if (!(root instanceof ContentTreeNode) && !config) {
			config = root;
			root = null;
		}

		return new TreeWalker(this, root || this, config);
	}
}
