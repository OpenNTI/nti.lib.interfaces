/* eslint-env jest */
import {createMockNode} from '../../../__test__/common';
import resolveChildrenItems from '../resolve-children-items';


describe('ContentTree resolveChildrenItems', () => {
	test('gives all children and items in correct order', async () => {
		const items = [
			{item: '1'},
			{item: '2'},
			{item: '3'},
			{item: '4'}
		];
		const children = items.map(item => createMockNode(item));

		const resolvedItems = await resolveChildrenItems(children);

		expect(resolvedItems.length).toBe(4);

		for (let i = 0; i < resolvedItems.length; i++) {
			const resolved = resolvedItems[i];
			const node = children[i];
			const item = items[i];

			expect(resolved.node).toEqual(node);
			expect(resolved.item).toEqual(item);
		}
	});
});
