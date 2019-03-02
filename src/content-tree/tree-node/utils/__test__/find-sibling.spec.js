/* eslint-env jest */
import {createMockNode} from '../../../__test__/common';
import {findNextSibling, findPrevSibling} from '../find-sibling';


describe('ContentTree findSiblings', () => {
	describe('findNextSibling', () => {
		test('returns null if last item in the parents', async () => {
			const item = {a: 'test-node'};
			const node = createMockNode(item);

			node.getParentNode = async () => {
				return createMockNode({parent: true}, {
					children: [
						createMockNode({child: true}),
						node
					]
				});
			};

			const next = await findNextSibling(node);

			expect(next).toBeNull();
		});

		test('returns next sibling', async () => {
			const anchor = createMockNode({anchor: true});
			const target = createMockNode({target: true});

			anchor.getParentNode = async () => {
				return createMockNode({parent: true}, {
					children: [
						anchor,
						target
					]
				});
			};

			const next = await findNextSibling(anchor);

			expect(next).toBe(target);
		});
	});

	describe('findPrevSibling', () => {
		test('returns null if last item in the parents', async () => {
			const item = {a: 'test-node'};
			const node = createMockNode(item);

			node.getParentNode = async () => {
				return createMockNode({parent: true}, {
					children: [
						node,
						createMockNode({child: true})
					]
				});
			};

			const next = await findPrevSibling(node);

			expect(next).toBeNull();
		});

		test('returns next sibling', async () => {
			const anchor = createMockNode({anchor: true});
			const target = createMockNode({target: true});

			anchor.getParentNode = async () => {
				return createMockNode({parent: true}, {
					children: [
						target,
						anchor
					]
				});
			};

			const next = await findPrevSibling(anchor);

			expect(next).toBe(target);
		});
	});
});
