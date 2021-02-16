export default function resolveChildrenItems(children) {
	return Promise.all(
		children.map(async node => {
			const item = await node.getItem();

			return { node, item };
		})
	);
}
