import { Node } from './tree-node/index.js';

export default {
	getContentTree() {
		return new Node(this);
	},
};
