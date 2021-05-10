import { Node } from './tree-node/index.js';

export default Target =>
	class extends Target {
		getContentTree() {
			return new Node(this);
		}
	};
