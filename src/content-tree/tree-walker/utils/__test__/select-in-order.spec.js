/* eslint-env jest */
import {createMockNode} from '../../../__test__/common';
import {selectNext, selectPrev} from '../select-in-order';

function create (name, parent, children, next, prev) {
	return createMockNode({name}, {parent, children, next, prev});
}

function createSkipped (name, parent, children, next, prev) {
	return createMockNode({name, skip: true}, {parent, children, next, prev});
}

function createIgnored (name, parent, children, next, prev) {
	return createMockNode({name, ignored: true}, {parent, children, next, prev});
}

function skip (item) {
	return item.skip;
}

function ignore (item) {
	return item.ignored;
}


describe('select-in-order', () => {
	describe('selectNext', () => {
		test('returns null if given root', async () => {
			const node = create('node');

			const next = await selectNext(node, node, skip, ignore);

			expect(next).toBeNull();
		});

		test('returns first child if not skipped', async () => {
			const root = create('root');
			const target = create('target');
			const node = create('node', root, [
				target
			]);

			const next = await selectNext(node, root, skip, ignore);

			expect(next).toBe(target);
		});

		test('still looks at children of skipped nodes', async () => {
			const root = create('root');
			const target = create('target');
			const node = create('node', root, [
				createSkipped('skip', null, [
					target
				])
			]);

			const next = await selectNext(node, root, skip, ignore);

			expect(next).toBe(target);
		});

		test('does NOT look at children of ignoreChildren nodes', async () => {
			const root = create('root');
			const target = create('target');
			const node = createIgnored('node', root, [
				create('child')
			], target);

			const next = await selectNext(node, root, skip, ignore);

			expect(next).toBe(target);
		});

		test('looks at the next sibling if there are no children', async () => {
			const root = create('root');
			const target = create('target');
			const node = create('node', root, null, target);

			const next = await selectNext(node, root, skip, ignore);

			expect(next).toBe(target);
		});

		test('looks at the parent nodes sibling if there are no siblings or children', async () => {
			const root = create('root');
			const target = create('target');
			const parent = create('parent', root, null, target);
			const node = create('node', parent, null);

			const next = await selectNext(node, root, skip, ignore);

			expect(next).toBe(target);
		});

		test('returns null if no descendants or siblings, and the parent node is the root', async () => {
			const root = create('root', null, null, create('redherring'));
			const node = create('node', root);

			const next = await selectNext(node, root, skip, ignore);

			expect(next).toBeNull();
		});
	});

	describe('selectPrev', () => {
		test('returns null if given the root', async () => {
			const node = create('node');

			const next = await selectPrev(node, node, skip, ignore);

			expect(next).toBeNull();
		});

		test('returns last child of previous sibling', async () => {
			const root = create('root');
			const target = create('target');
			const node = create('node', root, null, null,
				create('sibling', null, [
					create('red-herring'),
					create('sub-parent', null, [
						target
					])
				])
			);

			const prev = await selectPrev(node, root, skip, ignore);

			expect(prev).toBe(target);
		});

		test('returns last child that is not skipped of the previous sibling', async () => {
			const root = create('root');
			const target = create('target');
			const node = create('node', root, null, null,
				create('sibling', null, [
					createSkipped('skipped', null, null, null, target)
				])
			);

			const prev = await selectPrev(node, root, skip, ignore);

			expect(prev).toBe(target);
		});

		test('returns prev sibling if no children', async () => {
			const root = create('root');
			const target = create('target');
			const node = create('node', root, null, null, target);

			const prev = await selectPrev(node, root, skip, ignore);

			expect(prev).toBe(target);
		});

		test('returns prev sibling if its children are ignores', async () => {
			const root = create('root');
			const target = createIgnored('target', null, [
				create('red-herring')
			]);
			const node = create('node', root, null, null, target);

			const prev = await selectPrev(node, root, skip, ignore);

			expect(prev).toBe(target);
		});

		test('returns parent node if no sibling', async () => {
			const root = create('root');
			const target = create('target');
			const node = create('node', target);

			const prev = await selectPrev(node, root, skip, ignore);

			expect(prev).toBe(target);
		});
	});
});
