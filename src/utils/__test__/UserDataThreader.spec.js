import * as UserDataThreader from '../UserDataThreader';
import isEmpty from 'isempty';

describe('UserDataThreader utils', ()=> {

	it('Makes public api available', ()=> {
		expect(UserDataThreader.thread).to.be.ok;
	});

	describe('Parenting works as expected', ()=> {
		it('abandons links successfully', ()=> {
			let a = {
				[UserDataThreader.PARENT]: {},
				[UserDataThreader.CHILDREN]: []
			};

			expect(a[UserDataThreader.PARENT]).to.be.ok;
			expect(a[UserDataThreader.CHILDREN]).to.be.ok;

			UserDataThreader.tearDownThreadingLinks(a);
			expect(a[UserDataThreader.PARENT]).to.be.undefined;
			expect(a[UserDataThreader.PARENT]).to.be.undefined;
		});
	});

	describe('buildItemTree', ()=> {

		function createThreadable (name, placeholder) {
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
			expect(isEmpty(results)).to.not.be.ok;
			expect(results.length).to.equal(1);

			results = results[0];
			expect(results[UserDataThreader.PARENT]).to.be.undefined;
			expect(isEmpty(results[UserDataThreader.CHILDREN])).to.be.true;
		});

	});
});
