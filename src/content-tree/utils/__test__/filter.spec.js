/* eslint-env jest */
import filter from '../filter';

import {createMockNode} from './common';

const FILTERED_MATCH = /filtered$/;

function filterFn (item) {
	return item.matches;
}

function createHit (name) {
	return createMockNode({
		name,
		matches: true
	}, {
		filtered: createMockNode({
			name: `${name}-filtered`
		})
	});
}

function createMiss (name) {
	return createMockNode({
		name,
		matches: false
	});
}

function getChildren () {
	return [
		createHit('hit-1'),
		createMiss('miss-1'),
		createMiss('miss-2'),
		createHit('hit-2'),
		createHit('hit-3'),
		createMiss('miss-3')
	];
}



describe('ContentTree filter', () => {
	describe('non-recursive', () => {
		test('returns only children that match', async () => {
			const children = getChildren();
			const filtered = await filter(children, filterFn);

			expect(filtered.length).toBe(3);

			for (let child of filtered) {
				const item = await child.getItem();

				expect(item.matches).toBeTruthy();
			}
		});

		test('returns same instance of the node', async () => {
			const children = getChildren();
			const filtered = await filter(children, filterFn);

			expect(filtered[0]).toBe(children[0]);
			expect(filtered[1]).toBe(children[3]);
			expect(filtered[2]).toBe(children[4]);
		});

		test('did NOT call filter on nodes', async () => {
			const children = getChildren();
			const filtered = await filter(children, filterFn);

			for (let child of filtered) {
				expect(child.filter).not.toHaveBeenCalled();
			}
		});
	});

	describe('recursive', () => {
		test('returns only the filtered version of the children that match', async () => {
			const children = getChildren();
			const filtered = await filter(children, filterFn, true);

			expect(filtered.length).toBe(3);

			for (let child of filtered) {
				const item = await child.getItem();

				expect(item.name).toMatch(FILTERED_MATCH);
			}
		});

		test('returns filtered nodes in order', async () => {
			const children = getChildren();
			const filtered = await filter(children, filterFn, true);

			const items = await Promise.all(
				filtered.map(child => child.getItem())
			);

			expect(items[0].name).toBe('hit-1-filtered');
			expect(items[1].name).toBe('hit-2-filtered');
			expect(items[2].name).toBe('hit-3-filtered');
		});

		test('only called filter on nodes that match the filter fn', async () => {
			const children = getChildren();
			await filter(children, filterFn, true);

			expect(children[0].filter).toHaveBeenCalled();
			expect(children[1].filter).not.toHaveBeenCalled();
			expect(children[2].filter).not.toHaveBeenCalled();
			expect(children[3].filter).toHaveBeenCalled();
			expect(children[4].filter).toHaveBeenCalled();
			expect(children[5].filter).not.toHaveBeenCalled();
		});
	});
});
