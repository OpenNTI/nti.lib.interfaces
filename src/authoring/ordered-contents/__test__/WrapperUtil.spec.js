/* eslint-env jest */
import WrapperUtil from '../WrapperUtil.js';

function makeLabel(id) {
	return `Label ${id}`;
}

function createItem(id) {
	return {
		NTIID: id,
		label: makeLabel(id),
	};
}

function createNewItem(id) {
	return {
		isNewItem: true,
		label: makeLabel(id),
	};
}

describe('OrderedContents Tests', () => {
	let fakeService;
	let fakeObject;
	let items;
	let orderedContents;

	beforeEach(() => {
		fakeService = {
			getObjectPlaceholder(obj) {
				obj.isPlaceholder = true;
				obj.getData = () => obj;

				return obj;
			},

			postParseResponse(link, data) {
				return Promise.resolve(data);
			},

			putParseResponse(link, data) {
				return Promise.resolve(data);
			},
		};

		items = [createItem(1), createItem(2), createItem(3), createItem(4)];

		fakeObject = {
			getLink(rel) {
				return rel === 'ordered-contents' ? 'orderedcontents' : null;
			},

			Items: items,

			onChange() {},
		};

		jest.spyOn(fakeService, 'getObjectPlaceholder');
		jest.spyOn(fakeService, 'postParseResponse');
		jest.spyOn(fakeService, 'putParseResponse');

		orderedContents = new WrapperUtil(fakeObject, fakeService);
	});

	describe('Insert Tests', () => {
		test('Append adds the item to the end', done => {
			const item = createNewItem(5);

			orderedContents
				.append(item)
				.then(() => {
					expect(fakeService.postParseResponse).toHaveBeenCalledWith(
						'orderedcontents/index/4',
						expect.objectContaining({ label: makeLabel(5) })
					);
					expect(fakeService.putParseResponse).not.toHaveBeenCalled();

					expect(orderedContents.length).toEqual(5);
					expect(orderedContents.orderedContents[4].label).toEqual(
						makeLabel(5)
					);

					done();
				})
				.catch(done);
		});

		test('Insert adds item at the index', done => {
			const item = createNewItem(5);

			orderedContents
				.insertAt(item, 1)
				.then(() => {
					expect(fakeService.postParseResponse).toHaveBeenCalledWith(
						'orderedcontents/index/1',
						expect.objectContaining({ label: makeLabel(5) })
					);
					expect(fakeService.putParseResponse).not.toHaveBeenCalled();

					expect(orderedContents.length).toEqual(5);
					expect(orderedContents.orderedContents[1].label).toEqual(
						makeLabel(5)
					);

					done();
				})
				.catch(done);
		});
	});

	describe('Replace Tests', () => {
		test('Replace Item', done => {
			const newItem = createNewItem(5);
			const oldItem = createItem(1);

			orderedContents
				.replaceItem(oldItem, newItem)
				.then(() => {
					expect(
						fakeService.postParseResponse
					).not.toHaveBeenCalled();
					expect(fakeService.putParseResponse).toHaveBeenCalledWith(
						'orderedcontents/index/0',
						expect.objectContaining({
							label: makeLabel(5),
						})
					);

					expect(orderedContents.length).toEqual(4);
					expect(orderedContents.orderedContents[0].label).toEqual(
						makeLabel(5)
					);

					done();
				})
				.catch(done);
		});

		test('Replace at Index', done => {
			const newItem = createNewItem(5);

			orderedContents
				.replaceAt(newItem, 1)
				.then(() => {
					expect(
						fakeService.postParseResponse
					).not.toHaveBeenCalled();
					expect(fakeService.putParseResponse).toHaveBeenCalledWith(
						'orderedcontents/index/1',
						expect.objectContaining({
							label: makeLabel(5),
						})
					);

					expect(orderedContents.length).toEqual(4);
					expect(orderedContents.orderedContents[1].label).toEqual(
						makeLabel(5)
					);

					done();
				})
				.catch(done);
		});
	});
});
