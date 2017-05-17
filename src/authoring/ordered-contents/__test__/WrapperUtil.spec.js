import sinon from 'sinon';

import WrapperUtil from '../WrapperUtil';

function makeLabel (id) {
	return `Label ${id}`;
}

function createItem (id) {
	return {
		NTIID: id,
		label: makeLabel(id)
	};
}

function createNewItem (id) {
	return {
		isNewItem: true,
		label: makeLabel(id)
	};
}


describe('OrderedContents Tests', () => {
	let fakeService;
	let fakeObject;
	let items;
	let orderedContents;


	beforeEach(() => {
		fakeService = {
			getObjectPlaceholder (obj) {
				obj.isPlaceholder = true;
				obj.getData = () => obj;

				return obj;
			},


			postParseResponse (link, data) {
				return Promise.resolve(data);
			},


			putParseResponse (link, data) {
				return Promise.resolve(data);
			}
		};

		items = [
			createItem(1),
			createItem(2),
			createItem(3),
			createItem(4)
		];

		fakeObject = {
			getLink (rel) {
				return rel === 'ordered-contents' ? 'orderedcontents' : null;
			},

			Items: items,

			onChange () {}
		};



		sinon.spy(fakeService, 'getObjectPlaceholder');
		sinon.spy(fakeService, 'postParseResponse');
		sinon.spy(fakeService, 'putParseResponse');

		orderedContents = new WrapperUtil(fakeObject, fakeService);
	});


	describe('Insert Tests', () => {
		it('Append adds the item to the end', (done) => {
			const item = createNewItem(5);


			orderedContents.append(item)
				.then(() => {
					expect(fakeService.postParseResponse).to.be.calledWith('orderedcontents/index/4', sinon.match({label: makeLabel(5)}));
					expect(fakeService.putParseResponse).not.have.been.called;

					expect(orderedContents.length).toEqual(5);
					expect(orderedContents.orderedContents[4].label).toEqual(makeLabel(5));

					done();
				})
				.catch(done);
		});

		it('Insert adds item at the index', (done) => {
			const item = createNewItem(5);

			orderedContents.insertAt(item, 1)
				.then(() => {
					expect(fakeService.postParseResponse).to.be.calledWith('orderedcontents/index/1', sinon.match({label: makeLabel(5)}));
					expect(fakeService.putParseResponse).not.have.been.called;

					expect(orderedContents.length).toEqual(5);
					expect(orderedContents.orderedContents[1].label).toEqual(makeLabel(5));

					done();
				})
				.catch(done);
		});
	});

	describe('Replace Tests', () => {
		it('Replace Item', (done) => {
			const newItem = createNewItem(5);
			const oldItem = createItem(1);

			orderedContents.replaceItem(oldItem, newItem)
				.then(() => {
					expect(fakeService.postParseResponse).not.been.called;
					expect(fakeService.putParseResponse).to.be.calledWith('orderedcontents/index/0', sinon.match({
						label: makeLabel(5)
					}));

					expect(orderedContents.length).toEqual(4);
					expect(orderedContents.orderedContents[0].label).toEqual(makeLabel(5));

					done();
				})
				.catch(done);
		});

		it('Replace at Index', (done) => {
			const newItem = createNewItem(5);

			orderedContents.replaceAt(newItem, 1)
				.then(() => {
					expect(fakeService.postParseResponse).not.have.been.called;
					expect(fakeService.putParseResponse).to.be.calledWith('orderedcontents/index/1', sinon.match({
						label: makeLabel(5)
					}));

					expect(orderedContents.length).toEqual(4);
					expect(orderedContents.orderedContents[1].label).toEqual(makeLabel(5));

					done();
				})
				.catch(done);
		});
	});
});
