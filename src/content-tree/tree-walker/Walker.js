import {ERRORS} from '../Contants';
import {deferredValue} from '../utils';

import {
	findIndex,
	getDescendantCount,
	selectNext,
	selectPrev,
	selectDescendantMatching,
	selectFirstDescendant
} from './utils';

const CURRENT_NODE = Symbol('Current Node');
const ROOT = Symbol('Root Node');
const IGNORE_CHILDREN = Symbol('Ignore Children');
const SKIP = Symbol('Skip');

const MOVE = Symbol('Move');

export default class ContentTreeWalker {
	constructor (node, root, {skip, ignoreChildren} = {}) {
		if (!node) {
			throw new Error(ERRORS.getMessage('Tree Walker cannot be instantiated without a node'));
		}

		this[CURRENT_NODE] = deferredValue(node);
		this[ROOT] = deferredValue(root);
		this[SKIP] = skip;
		this[IGNORE_CHILDREN] = ignoreChildren;
	}

	async getCurrentNode () {
		return this[CURRENT_NODE].resolve();
	}

	async getRootNode () {
		return this[ROOT].resolve();
	}

	async getDescendantLength () {
		const node = await this.getCurrentNode();

		return getDescendantCount(node, this[SKIP], this[IGNORE_CHILDREN]);
	}

	async findIndexOfDescendant (predicate) {
		ERRORS.throwIfNotFunction(predicate, ERRORS.getMessage('findIndexOfDescendant must be given a function'));

		const node = await this.getCurrentNode();

		return findIndex(node, predicate, this[SKIP], this[IGNORE_CHILDREN]);
	}


	[MOVE] (node) {
		return new ContentTreeWalker(node, () => this.getRootNode(), {skip: this[SKIP], ignoreChildren: this[IGNORE_CHILDREN]});
	}


	selectNext () {
		const next = async () => {
			try {
				const root = await this.getRootNode();
				const node = await this.getCurrentNode();

				return selectNext(node, root, this[SKIP], this[IGNORE_CHILDREN]);
			} catch (e) {
				return null;
			}
		};

		return this[MOVE](next);
	}


	selectPrev () {
		const prev = async () => {
			try {
				const root = await this.getRootNode();
				const node = await this.getCurrentNode();

				return selectPrev(node, root, this[SKIP], this[IGNORE_CHILDREN]);
			} catch (e) {
				return null;
			}
		};

		return this[MOVE](prev);
	}


	selectDescendantMatching (predicate) {
		const descendant = async () => {
			try {
				const node = await this.getCurrentNode();

				return selectDescendantMatching(node, predicate, this[SKIP], this[IGNORE_CHILDREN]);
			} catch (e) {
				return null;
			}
		};

		return this[MOVE](descendant);
	}


	selectFirstDescendant () {
		const descendant = async () => {
			try {

				const node = await this.getCurrentNode();

				return selectFirstDescendant(node, this[SKIP], this[IGNORE_CHILDREN]);
			} catch (e) {
				return null;
			}
		};

		return this[MOVE](descendant);
	}
}
