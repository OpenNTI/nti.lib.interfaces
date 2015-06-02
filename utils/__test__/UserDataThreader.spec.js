import * as UserDataThreader from '../UserDataThreader';
import isEmpty from '../isempty';

describe('UserDataThreader utils', ()=> {

	it('Makes public api available', ()=> {
		expect(UserDataThreader.thread).toBeTruthy();
	});

	describe('Parenting works as expected', ()=> {
		it('abandons links successfully', ()=> {
			let a = {
				[UserDataThreader.PARENT]: {},
				[UserDataThreader.CHILDREN]: []
			};

			expect(a[UserDataThreader.PARENT]).toBeTruthy();
			expect(a[UserDataThreader.CHILDREN]).toBeTruthy();

			UserDataThreader.tearDownThreadingLinks(a);
			expect(a[UserDataThreader.PARENT]).toBeUndefined();
			expect(a[UserDataThreader.PARENT]).toBeUndefined();
		});
	});

	describe('buildItemTree', ()=> {

		function createThreadable(name, placeholder) {
			let n = {
				isThreadable: true,
				parent: {},
				children: [],
				placeholder,
				Class: name,
				getID: () => 'foo'
			};

			return n;
		}

		it('abandons preexisting relationships', ()=> {
			let n = createThreadable('Note'), tree = {}, results;

			UserDataThreader.buildItemTree([n], tree);
			UserDataThreader.cleanupTree(tree);

			results = Object.values(tree);
			expect(isEmpty(results)).toBeFalsy();
			expect(results.length).toEqual(1);

			results = results[0];
			expect(results[UserDataThreader.PARENT]).toBeUndefined();
			expect(isEmpty(results[UserDataThreader.CHILDREN])).toBe(true);
		});

	});
});
