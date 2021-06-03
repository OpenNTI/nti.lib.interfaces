import { Node } from './tree-node/index.js';

/**
 * @template {import('../constants').Constructor} T
 * @param {T} Base
 * @mixin
 */
export const mixin = Base =>
	class extends Base {
		getContentTree() {
			return new Node(this);
		}
	};
