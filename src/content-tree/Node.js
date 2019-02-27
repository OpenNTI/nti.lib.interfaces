import {Array as arr} from '@nti/lib-commons';

import {
	createValueResolver,
	filter,
	find,
	flatten
} from './utils';
import {GET_CONTENT_TREE_CHILDREN, ERRORS} from './Contants';

const ITEM = Symbol('Item');
const PARENT = Symbol('Parent');

const CHILDREN = Symbol('Children');
const CLONES = Symbol('Clones');
const RESOLVE_CHILDREN = Symbol('Resolve Children');
const MUTATE_CHILDREN_AND_CLONE = Symbol('Create Clone');

function ifEmptyNodeError (error, newMsg) {
	if (error instanceof ERRORS.EMPTY_NODE) {
		throw new ERRORS.EMPTY_NODE(newMsg);
	}

	throw error;
}

function ifNotFunctionThrow (maybeFn, msg) {
	if (!maybeFn || typeof maybeFn !== 'function') {
		throw new Error(msg);
	}
}

export default class ContentTreeNode {
	constructor (item, parent, config = {}) {
		this[ITEM] = createValueResolver(item);
		this[PARENT] = createValueResolver(parent);

		this[CHILDREN] = createValueResolver(config[CHILDREN] || (() => this[RESOLVE_CHILDREN]()));
		this[CLONES] = config[CLONES] && createValueResolver(config[CLONES]);
	}

	get isClone () {
		return !!this[CLONES];
	}

	async isEmptyNode () {
		const item = await this.getItem();

		return !item;
	}

	async resolve () {
		const item = await this.getItem();
		const parent = await this.getParent();
		const childNodes = await this.getChildNodes();

		return {
			item,
			parent,
			childNodes
		};
	}

	async getItem () {
		if (this.isClone) {
			return this[CLONES].resolve().getItem();
		}

		return await this[ITEM].resolve();
	}

	async getParentNode () {
		if (this.isClone) {
			return this[CLONES].resolve().getParentNode();
		}

		return await this[PARENT].resolve();
	}

	async getChildNodes () {
		if (this.isClone) {
			return this[CLONES].resolve().getChildNodes();
		}

		return this[CHILDREN].resolve();
	}


	async [RESOLVE_CHILDREN] () {
		const empty = await this.isEmptyNode();

		if (empty) {
			throw new ERRORS.EMPTY_NODE(ERRORS.getMessage('Cannot resolve children on an empty node.'));
		}

		const item = await this.getItem();
		const parent = await this.getParentNode();

		if (!item || !item[GET_CONTENT_TREE_CHILDREN]) {
			return null;
		}

		const children = await item[GET_CONTENT_TREE_CHILDREN](parent);

		return arr.ensure(children)
			.map(child => new ContentTreeNode(child, this));
	}


	[MUTATE_CHILDREN_AND_CLONE] (children) {
		return new ContentTreeNode(() => this.getItem(), () => this.getParentNode(), {[CHILDREN]: children});
	}


	filterChildren (filterFn) {
		ifNotFunctionThrow(filterFn, ERRORS.getMessage('filterChildren must be given a function.'));

		const filtered = async () => {
			try {
				const children = await this.getChildNodes();

				return filter(children, filterFn);
			} catch (e) {
				ifEmptyNodeError(e, ERRORS.getMessage('Cannot call filterChildren on an empty node.'));
			}
		};

		return this[MUTATE_CHILDREN_AND_CLONE](filtered);
	}


	filter (filterFn) {
		ifNotFunctionThrow(filterFn, ERRORS.getMessage('filter must be given a function.'));

		const filtered = async () => {
			try {
				const children = await this.getChildNodes();

				return filter(children, filterFn, true);
			} catch (e) {
				ifEmptyNodeError(e, ERRORS.getMessage('Cannot call filter on an empty node.'));
			}
		};

		return this[MUTATE_CHILDREN_AND_CLONE](filtered);
	}


	flatten () {
		const flattened = async () => {
			try {
				const children = await this.getChildNodes();

				return flatten(children);
			} catch (e) {
				ifEmptyNodeError(e, ERRORS.getMessage('Cannot call flatten on an empty node.'));
			}
		};

		return this[MUTATE_CHILDREN_AND_CLONE](flattened);
	}


	findChild (predicate) {
		ifNotFunctionThrow(predicate, ERRORS.getMessage('findChild must be given a function'));

		const clone = async () => {
			try {
				const children = await this.getChildNodes();

				return find(children, predicate);
			} catch (e) {
				ifEmptyNodeError(e, ERRORS.getMessage('Cannot call findChild on an empty node.'));
			}
		};

		return new ContentTreeNode(null, null, {[CLONES]: clone});
	}


	find (predicate) {
		ifNotFunctionThrow(predicate, ERRORS.getMessgae('find must be given a function'));

		const clone = async () => {
			try {
				const children = await this.getChildNodes();

				return find(children, predicate);
			} catch (e) {
				ifEmptyNodeError(e, ERRORS.getMessage('Cannot call find on an empty node.'));
			}
		};

		return new ContentTreeNode(null, null, {[CLONES]: clone});
	}
}

