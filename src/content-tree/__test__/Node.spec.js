/* eslint-env jest */
import Node from '../Node';
import {GET_CONTENT_TREE_CHILDREN, ERRORS} from '../Contants';


function createObject (name, children) {
	const obj = {
		name
	};

	if (children) {
		obj[GET_CONTENT_TREE_CHILDREN] = async () => children;
		jest.spyOn(obj, GET_CONTENT_TREE_CHILDREN);
	}

	return obj;
}

function createObjectResolver (object) {
	return jest.fn(() => object);
}

describe('ContentTree Node', () => {
	describe('isEmptyNode', () => {
		test('true if there is NOT an item', async () => {
			const node = new Node(null);
			const isEmpty = await node.isEmptyNode();

			expect(isEmpty).toBeTruthy();
		});

		test('false if there is an item', async () => {
			const node = new Node(createObject('Test'));
			const isEmpty = await node.isEmptyNode();

			expect(isEmpty).toBeFalsy();
		});
	});

	describe('getItem', () => {
		test('returns item passed in', async () => {
			const object = createObject('Test');
			const node = new Node(object);

			const item = await node.getItem();

			expect(item).toBe(object);
		});

		test('defers resolving item', async () => {
			const object = createObject('Test');
			const resolver = createObjectResolver(object);

			const node = new Node(resolver);

			expect(resolver).not.toHaveBeenCalled();

			const item = await node.getItem();

			expect(item).toBe(object);
			expect(resolver).toHaveBeenCalledTimes(1);
		});
	});

	describe('getParent', () => {
		test('returns parent passed in', async () => {
			const parent = new Node();
			const node = new Node(null, parent);

			const parentNode = await node.getParentNode();

			expect(parentNode).toBe(parent);
		});

		test('defers resolving parent', async () => {
			const parent = new Node();
			const resolver = createObjectResolver(parent);

			const node = new Node(null, resolver);

			expect(resolver).not.toHaveBeenCalled();

			const item = await node.getParentNode();

			expect(item).toBe(parent);
			expect(resolver).toHaveBeenCalledTimes(1);
		});
	});


	describe('getChildNodes', () => {
		test('throws if no item', async () => {
			const node = new Node();
			let threw = false;

			try {
				const children = await node.getChildNodes();

				expect(children).toEqual('Resolve did not throw');
			} catch (e) {
				threw = true;
				expect(e).toBeInstanceOf(ERRORS.EMPTY_NODE);
			}

			if (!threw) {
				expect('Did throw').toEqual('Did not Throw');
			}
		});

		test('item does NOT define GET_CONTENT_TREE_CHILDREN', async () => {
			const node = new Node(createObject('Item'));

			const children = await node.getChildNodes();

			expect(children).toBeNull();
		});

		test('items GET_CONTENT_TREE_CHILDREN returns one sub item', async () => {
			const subObject = createObject('Sub Item');
			const object = createObject('Item', subObject);
			const parent = new Node(createObject('Parent'));
			const node = new Node(object, parent);

			expect(object[GET_CONTENT_TREE_CHILDREN]).not.toHaveBeenCalled();

			const children = await node.getChildNodes();

			expect(object[GET_CONTENT_TREE_CHILDREN]).toHaveBeenCalledWith(parent);

			expect(children.length).toBe(1);

			const item = await children[0].getItem();

			expect(item).toBe(subObject);

		});

		test('item GET_CONTENT_TREE_CHILDREN returns a list of sub items', async () => {
			const subObjects = [
				createObject('Sub Item 1'),
				createObject('Sub Item 2'),
				createObject('Sub Item 3')
			];
			const object = createObject('Item', subObjects);

			const parent = new Node(createObject('Parent'));
			const node = new Node(object, parent);

			expect(object[GET_CONTENT_TREE_CHILDREN]).not.toHaveBeenCalled();

			const children = await node.getChildNodes();

			expect(object[GET_CONTENT_TREE_CHILDREN]).toHaveBeenCalledWith(parent);

			expect(children.length).toBe(3);

			const items = await Promise.all(
				children.map(async (child) => await child.getItem())
			);

			for (let i = 0; i < items.length; i++) {
				const item = items[i];
				const subObject = subObjects[i];

				expect(item).toBe(subObject);
			}
		});
	});
});
