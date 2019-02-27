/* eslint-env jest */
import find from '../find';

import {createMockNode} from './common';

function create (name, children) {
	return createMockNode({
		name
	}, {children});
}

function makeNamePredicate (...names) {
	return (item) => {
		return names.indexOf(item.name) >= 0;
	};
}

describe('ContentTree find', () => {
	describe('No or empty children', () => {
		test('non-resursive', async () => {
			const findNo = await find(null, makeNamePredicate('name'));
			const findEmpty = await find([], makeNamePredicate('name'));

			expect(findNo).toBeNull();
			expect(findEmpty).toBeNull();
		});


		test('resursive', async () => {
			const findNo = await find(null, makeNamePredicate('name'), true);
			const findEmpty = await find([], makeNamePredicate('name'), true);

			expect(findNo).toBeNull();
			expect(findEmpty).toBeNull();
		});
	});

	describe('function predicate', () => {
		const getChildren = () => ([
			create('node-1', [
				create('node-1-1', [
					create('node-1-1-1'),
					create('node-1-1-2', [
						create('node-1-1-2-1')
					]),
				])
			]),
			create('node-2'),
			create('node-3', [
				create('node-3-1'),
				create('node-3-2', [
					create('node-3-2-1')
				])
			])
		]);

		describe('non-recursive', () => {
			test('finds top-level hit', async () => {
				const children = getChildren();
				const found = await find(children, makeNamePredicate('node-3'));

				expect(found).not.toBeNull();

				const item = await found.getItem();

				expect(item.name).toBe('node-3');
			});

			test('does NOT find nth-level hit', async () => {
				const children = getChildren();
				const found = await find(children, makeNamePredicate('node-1-1'));

				expect(found).toBeNull();
			});

			test('returns null for no hit', async () => {
				const children = getChildren();
				const found = await find(children, makeNamePredicate('not-there'));

				expect(found).toBeNull();
			});

			test('finds first node that matches', async () => {
				const children = getChildren();
				const found = await find(children, makeNamePredicate('node-3', 'node-2'));

				expect(found).not.toBeNull();

				const item = await found.getItem();

				expect(item.name).toBe('node-2');
			});
		});

		describe('recursive', () => {
			test('finds nth-level hit', async () => {
				const toCheck = ['node-1', 'node-1-1', 'node-1-1-1', 'node-3-1', 'node-3-2-1', 'node-1-1-2-1'];
				const children = getChildren();

				for (let check of toCheck) {
					const found = await find(children, makeNamePredicate(check), true);

					expect(found).not.toBeNull();

					const item = await found.getItem();

					expect(item.name).toBe(check);
				}
			});

			test('returns null for no hit', async () => {
				const children = getChildren();
				const found = await find(children, makeNamePredicate('not-there'), true);

				expect(found).toBeNull();
			});

			test('does breadth first search', async () => {
				const toCheck = [
					//should find [0] before [1]
					['node-1', 'node-2'],
					['node-2', 'node-1-1'],
					['node-1-1', 'node-3-1'],
					['node-3-1', 'node-1-1-1'],
					['node-3-1', 'node-3-2-1'],
					['node-1-1-2', 'node-3-2-1'],
					['node-1-1-1', 'node-1-1-2'],
				];
				const children = getChildren();

				for (let check of toCheck) {
					const [first, second] = check;
					const found = await find(children, makeNamePredicate(second, first), true);

					expect(found).not.toBeNull();

					const item = await found.getItem();

					expect(item.name).toBe(first);
				}
			});
		});
	});
});
