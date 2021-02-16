/* eslint-env jest */
import filter from '../filter-non-required-items';

function buildItem(required, items, label) {
	return {
		CompletionRequired: required,
		Items: items,
		label,
	};
}

describe('filterNonRequriedItems', () => {
	test('Not required, no items', () => {
		const item = buildItem(false, null, 'label');
		const filtered = filter(item);

		expect(filtered.label).toEqual('label');
		expect(filtered.Items).toBeFalsy();
	});

	test('Not required, no required items', () => {
		const item = buildItem(
			false,
			[buildItem(false), buildItem(false)],
			'label'
		);
		const filtered = filter(item);

		expect(filtered).toBeTruthy();
		expect(filtered.label).toEqual('label');
		expect(filtered.Items).toEqual([]);
	});

	test('Not required, some required items', () => {
		const item = buildItem(
			false,
			[
				buildItem(true, null, 'child-1'),
				buildItem(false),
				buildItem(true, null, 'child-2'),
			],
			'label'
		);
		const filtered = filter(item);

		expect(filtered).toBeTruthy();
		expect(filtered.label).toEqual('label');

		expect(filtered.Items.length).toEqual(2);
		expect(filtered.Items[0].label).toEqual('child-1');
		expect(filtered.Items[1].label).toEqual('child-2');
	});
});
