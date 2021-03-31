/* eslint-env jest */
import { isEmpty } from '@nti/lib-commons';

import * as UserDataThreader from '../UserDataThreader.js';

describe('UserDataThreader utils', () => {
	test('Makes public api available', () => {
		expect(UserDataThreader.thread).toBeTruthy();
	});

	describe('Parenting works as expected', () => {
		test('abandons links successfully', () => {
			let a = {
				[UserDataThreader.PARENT]: {},
				[UserDataThreader.CHILDREN]: [],
			};

			expect(a[UserDataThreader.PARENT]).toBeTruthy();
			expect(a[UserDataThreader.CHILDREN]).toBeTruthy();

			UserDataThreader.tearDownThreadingLinks(a);
			expect(a[UserDataThreader.PARENT]).toBeUndefined();
			expect(a[UserDataThreader.PARENT]).toBeUndefined();
		});
	});

	describe('buildItemTree', () => {
		function createThreadable(name, placeholder) {
			let n = {
				isThreadable: true,
				parent: {},
				children: [],
				placeholder,
				Class: name,
				getID: () => 'foo',
			};

			return n;
		}

		test('abandons preexisting relationships', () => {
			let n = createThreadable('Note'),
				tree = {},
				results;

			UserDataThreader.buildItemTree([n], tree);
			UserDataThreader.cleanupTree(tree);

			results = Object.values(tree);
			expect(isEmpty(results)).not.toBeTruthy();
			expect(results.length).toEqual(1);

			results = results[0];
			expect(results[UserDataThreader.PARENT]).toBeUndefined();
			expect(isEmpty(results[UserDataThreader.CHILDREN])).toBe(true);
		});
	});
});
