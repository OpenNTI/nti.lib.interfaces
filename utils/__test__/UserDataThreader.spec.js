import * as UserDataThreader from '../UserDataThreader';
import isEmpty from '../isempty';

describe('UserDataThreader utils', ()=> {

	it('Makes public api available', ()=> {
		expect(UserDataThreader.threadUserData).toBeTruthy();
		expect(UserDataThreader.buildThreads).toBeTruthy();
	});

	describe('Parenting works as expected', ()=> {
		it('abandons links successfully', ()=> {
			let a = {
				parent: {},
				children: []
			};

			expect(a.parent).toBeTruthy();
			expect(a.children).toBeTruthy();

			UserDataThreader.tearDownThreadingLinks(a);
			expect(a.parent).toBeUndefined();
			expect(a.parent).toBeUndefined();
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
			expect(results.parent).toBeUndefined();
			expect(isEmpty(results.children)).toBe(true);
		});

	});
});
