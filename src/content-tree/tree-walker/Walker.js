import { ERRORS } from '../constants.js';
import { deferredValue } from '../utils/index.js';

import {
	getNodes,
	getNodeCount,
	getNodesBefore,
	getNodesAfter,
	getIndexOf,
	selectNext,
	selectPrev,
	selectDescendantMatching,
	selectFirstDescendant,
} from './utils/index.js';

const CURRENT_NODE = Symbol('Current Node');
const ROOT = Symbol('Root Node');
const IGNORE_CHILDREN = Symbol('Ignore Children');
const SKIP = Symbol('Skip');

const MOVE = Symbol('Move');

export default class ContentTreeWalker {
	constructor(node, root, { skip, ignoreChildren } = {}) {
		if (!node) {
			throw new Error(
				ERRORS.getMessage(
					'Tree Walker cannot be instantiated without a node'
				)
			);
		}

		this[CURRENT_NODE] = deferredValue(node);
		this[ROOT] = deferredValue(root);
		this[SKIP] = skip;
		this[IGNORE_CHILDREN] = ignoreChildren;
	}

	async getCurrentNode() {
		return this[CURRENT_NODE].resolve();
	}

	async getRootNode() {
		return this[ROOT].resolve();
	}

	async getNodes() {
		const root = await this.getRootNode();

		return getNodes(root, this[SKIP], this[IGNORE_CHILDREN]);
	}

	async getNodeCount() {
		const root = await this.getRootNode();

		return getNodeCount(root, this[SKIP], this[IGNORE_CHILDREN]);
	}

	async getNodesBefore(predicate) {
		ERRORS.throwIfNotFunction(predicate);

		const root = await this.getRootNode();

		return getNodesBefore(
			root,
			predicate,
			this[SKIP],
			this[IGNORE_CHILDREN]
		);
	}

	async getNodesAfter(predicate) {
		ERRORS.throwIfNotFunction(predicate);

		const root = await this.getRootNode();

		return getNodesAfter(
			root,
			predicate,
			this[SKIP],
			this[IGNORE_CHILDREN]
		);
	}

	async getIndexOf(predicate) {
		ERRORS.throwIfNotFunction(predicate);

		const root = await this.getRootNode();

		return getIndexOf(root, predicate, this[SKIP], this[IGNORE_CHILDREN]);
	}

	[MOVE](node) {
		return new ContentTreeWalker(node, () => this.getRootNode(), {
			skip: this[SKIP],
			ignoreChildren: this[IGNORE_CHILDREN],
		});
	}

	selectNext() {
		const next = async () => {
			try {
				const root = await this.getRootNode();
				const node = await this.getCurrentNode();

				return selectNext(
					node,
					root,
					this[SKIP],
					this[IGNORE_CHILDREN]
				);
			} catch (e) {
				return null;
			}
		};

		return this[MOVE](next);
	}

	selectPrev() {
		const prev = async () => {
			try {
				const root = await this.getRootNode();
				const node = await this.getCurrentNode();

				return selectPrev(
					node,
					root,
					this[SKIP],
					this[IGNORE_CHILDREN]
				);
			} catch (e) {
				return null;
			}
		};

		return this[MOVE](prev);
	}

	selectDescendantMatching(predicate) {
		ERRORS.throwIfNotFunction(predicate);

		const descendant = async () => {
			try {
				const node = await this.getCurrentNode();

				return selectDescendantMatching(
					node,
					predicate,
					this[SKIP],
					this[IGNORE_CHILDREN]
				);
			} catch (e) {
				return null;
			}
		};

		return this[MOVE](descendant);
	}

	selectFirstDescendant() {
		const descendant = async () => {
			try {
				const node = await this.getCurrentNode();

				return selectFirstDescendant(
					node,
					this[SKIP],
					this[IGNORE_CHILDREN]
				);
			} catch (e) {
				return null;
			}
		};

		return this[MOVE](descendant);
	}
}
