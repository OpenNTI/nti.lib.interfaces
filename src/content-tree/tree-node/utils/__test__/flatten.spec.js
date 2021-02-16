/* eslint-env jest */
import { createMockNode } from '../../../__test__/common';
import flatten from '../flatten';

function create(name, flattened) {
	return createMockNode(
		{
			name,
		},
		{
			flattened: flattened
				? createMockNode({ name }, { children: flattened })
				: createMockNode({ name }),
		}
	);
}

describe('ContentTree flatten', () => {
	test('no or empty children', async () => {
		const flattenNo = await flatten(null);

		const empty = [];
		const flattenEmpty = await flatten(empty);

		expect(flattenNo).toBeNull();
		expect(flattenEmpty).toEqual(empty);
	});

	describe('one level deep', () => {
		const getChildren = () => [
			create('1'),
			create('2'),
			create('3'),
			create('4'),
		];

		test('keeps all nodes', async () => {
			const flat = await flatten(getChildren());

			expect(flat.length).toBe(4);
		});

		test('is in depth first order', async () => {
			const flat = await flatten(getChildren());

			const items = await Promise.all(
				flat.map(async item => await item.getItem())
			);

			expect(items[0].name).toBe('1');
			expect(items[1].name).toBe('2');
			expect(items[2].name).toBe('3');
			expect(items[3].name).toBe('4');
		});

		test('calls flatten on every node', async () => {
			const children = getChildren();

			await flatten(children);

			for (let child of children) {
				expect(child.flatten).toHaveBeenCalled();
			}
		});
	});

	describe('multiple levels deep', () => {
		const getChildren = () => [
			create('1', [create('1-1'), create('1-2'), create('1-3')]),
			create('2'),
			create('3', [create('3-1'), create('3-2'), create('3-3')]),
			create('4'),
		];

		test('keeps all nodes', async () => {
			const flat = await flatten(getChildren());

			expect(flat.length).toBe(10);
		});

		test('is in depth first order', async () => {
			const flat = await flatten(getChildren());

			const items = await Promise.all(
				flat.map(async item => await item.getItem())
			);

			expect(items[0].name).toBe('1');
			expect(items[1].name).toBe('1-1');
			expect(items[2].name).toBe('1-2');
			expect(items[3].name).toBe('1-3');
			expect(items[4].name).toBe('2');
			expect(items[5].name).toBe('3');
			expect(items[6].name).toBe('3-1');
			expect(items[7].name).toBe('3-2');
			expect(items[8].name).toBe('3-3');
			expect(items[9].name).toBe('4');
		});
	});
});
