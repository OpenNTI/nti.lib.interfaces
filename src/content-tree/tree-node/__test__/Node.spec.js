/* eslint-env jest */
import Node from '../Node';


function createObject (name, children) {
	const obj = {
		name
	};

	if (children) {
		obj.getContentTreeChildrenSource = async () => children;
		jest.spyOn(obj, 'getContentTreeChildrenSource');
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
		test('item does NOT define getContentTreeChildrenSource', async () => {
			const node = new Node(createObject('Item'));

			const children = await node.getChildNodes();

			expect(children).toBeNull();
		});

		test('items getContentTreeChildrenSource returns one sub item', async () => {
			const subObject = createObject('Sub Item');
			const object = createObject('Item', subObject);
			const parent = new Node(createObject('Parent'));
			const node = new Node(object, parent);

			expect(object.getContentTreeChildrenSource).not.toHaveBeenCalled();

			const children = await node.getChildNodes();

			expect(object.getContentTreeChildrenSource).toHaveBeenCalledWith(parent);

			expect(children.length).toBe(1);

			expect(children[0]).toBeInstanceOf(Node);

			const item = await children[0].getItem();
			const childParent = await children[0].getParentNode();

			expect(item).toBe(subObject);
			expect(childParent).toBe(node);

		});

		test('item getContentTreeChildrenSource returns a list of sub items', async () => {
			const subObjects = [
				createObject('Sub Item 1'),
				createObject('Sub Item 2'),
				createObject('Sub Item 3')
			];
			const object = createObject('Item', subObjects);

			const parent = new Node(createObject('Parent'));
			const node = new Node(object, parent);

			expect(object.getContentTreeChildrenSource).not.toHaveBeenCalled();

			const children = await node.getChildNodes();

			expect(object.getContentTreeChildrenSource).toHaveBeenCalledWith(parent);

			expect(children.length).toBe(3);

			for (let child of children) {
				expect(child).toBeInstanceOf(Node);
			}

			const items = await Promise.all(
				children.map(async (child) => await child.getItem())
			);
			const parents = await Promise.all(
				children.map(async (child) => await child.getParentNode())
			);

			for (let i = 0; i < items.length; i++) {
				const item = items[i];
				const subObject = subObjects[i];

				expect(item).toBe(subObject);
			}

			for (let childParent of parents) {
				expect(childParent).toBe(node);
			}
		});
	});

	describe('filter methods (filter, filterChildren)', () => {
		test('throw if not given a function', () => {
			const node = new Node(createObject('Item'));

			expect(() => node.filterChildren()).toThrow();
			expect(() => node.filterChildren([])).toThrow();
			expect(() => node.filter()).toThrow();
			expect(() => node.filter([])).toThrow();
		});

		test('returns a different node that has same item and parent', async () => {
			const parentObject = createObject('Parent');
			const object = createObject('Item');

			const parentNode = new Node(parentObject);
			const node = new Node(object, parentNode);

			const toCheck = [
				node.filter(() => {}),
				node.filterChildren(() => {})
			];

			for (let check of toCheck) {
				expect(check).not.toBe(node);
				expect(check).toBeInstanceOf(Node);

				const checkParent = await check.getParentNode();
				const checkItem = await check.getItem();

				expect(checkParent).toBe(parentNode);
				expect(checkItem).toBe(object);
			}
		});

		test('do NOT call getContentTreeChildrenSource on the item', async () => {
			const object = createObject('Item', []);
			const node = new Node(object);

			node.filter(() => true);

			expect(object.getContentTreeChildrenSource).not.toHaveBeenCalled();

			node.filterChildren(() => true);

			expect(object.getContentTreeChildrenSource).not.toHaveBeenCalled();
		});

		const filterName = 'filter';
		const filterFn = item => item.name === filterName;
		const buildObjects = () => {
			const notFilteredObject = createObject('SubItem', [
				createObject(filterName),
				createObject('SubSubItem')
			]);

			const object = createObject('Item', [
				notFilteredObject,
				createObject(filterName, [
					createObject('Should be filtered because of parent')
				])
			]);

			return {
				object,
				notFilteredObject
			};
		};

		test('filterChildren filters only immediate children and not grandchildren', async () => {
			const {object, notFilteredObject} = buildObjects();

			const node = new Node(object);

			const filtered = node.filterChildren(filterFn);
			const children = await filtered.getChildNodes();

			expect(children.length).toBe(1);

			const filteredNode = children[0];
			const filteredObject = await filteredNode.getItem();
			const filteredChildren = await filteredNode.getChildNodes();

			expect(filteredObject).toBe(notFilteredObject);
			expect(filteredChildren.length).toBe(2);

		});

		test('filter filters children and grand children', async () => {
			const {object, notFilteredObject} = buildObjects();

			const node = new Node(object);

			const filtered = node.filter(filterFn);
			const children = await filtered.getChildNodes();

			expect(children.length).toBe(1);

			const filteredNode = children[0];
			const filteredObject = await filteredNode.getItem();
			const filteredChildren = await filteredNode.getChildNodes();

			expect(filteredObject).toBe(notFilteredObject);
			expect(filteredChildren.length).toBe(1);
		});
	});

	describe('flatten', () => {
		test('returns a different node with same item and parent', async () => {
			const object = createObject('Item');
			const parentNode = new Node(createObject('Parent'));
			const node = new Node(object, parentNode);

			const flattened = node.flatten();

			expect(flattened).toBeInstanceOf(Node);
			expect(flattened).not.toBe(node);

			const flattenedObject = await flattened.getItem();
			const flattenedParent = await flattened.getParentNode();

			expect(flattenedObject).toBe(object);
			expect(flattenedParent).toBe(parentNode);
		});

		test('all children of the flattened node are they in the breadth first order', async () => {
			const object = createObject('Parent', [
				createObject('node 1', [
					createObject('node 1-1', [
						createObject('node 1-1-1')
					]),
					createObject('node 1-2')
				]),
				createObject('node 2'),
				createObject('node 3', [
					createObject('node 3-1'),
					createObject('node 3-2', [
						createObject('node 3-2-1'),
						createObject('node 3-2-2')
					])
				])
			]);

			const node = new Node(object);

			const flattened = node.flatten();

			const children = await flattened.getChildNodes();

			expect(children.length).toBe(10);

			const items = await Promise.all(
				children.map(async child => child.getItem())
			);

			const names = items.map(item => item.name);

			expect(names).toEqual([
				'node 1',
				'node 1-1',
				'node 1-1-1',
				'node 1-2',
				'node 2',
				'node 3',
				'node 3-1',
				'node 3-2',
				'node 3-2-1',
				'node 3-2-2'
			]);

		});
	});


	describe('find methods (find, findChild)', () => {
		test('throws if not given a function', () => {
			const node = new Node();

			expect(() => node.find()).toThrow();
			expect(() => node.find([])).toThrow();
			expect(() => node.findChild()).toThrow();
			expect(() => node.findChild([])).toThrow();
		});

		test('do NOT call getContentTreeChildrenSource on the item', async () => {
			const object = createObject('Item', []);
			const node = new Node(object);

			node.find(() => {});

			expect(object.getContentTreeChildrenSource).not.toHaveBeenCalled();

			node.findChild(() => {});

			expect(object.getContentTreeChildrenSource).not.toHaveBeenCalled();
		});

		test('return an empty node if no node found', async () => {
			const node = new Node(createObject('Item', [
				createObject('SubItem')
			]));

			const child = node.findChild(() => false);
			const found = node.find(() => false);

			expect(child).toBeInstanceOf(Node);
			expect(found).toBeInstanceOf(Node);

			await expect(child.isEmptyNode()).resolves.toBeTruthy();
			await expect(found.isEmptyNode()).resolves.toBeTruthy();
		});

		const findName = 'find';
		const findPredicate = item => item.name === findName;

		test('findChild finds first children that matches and ignores grandchildren', async () => {
			const find = createObject(findName);
			const object = createObject('Item', [
				createObject('Child', [
					createObject(findName)
				]),
				createObject('Child2'),
				find,
				createObject(findName)
			]);

			const node = new Node(object);

			const found = node.findChild(findPredicate);

			const item = await found.getItem();

			expect(item).toBe(find);
		});


		test('find finds grandchildren', async () => {
			const find = createObject(findName);
			const object = createObject('Item', [
				createObject('Child'),
				createObject('Child', [
					createObject('sub-child', [
						find,
						createObject(findName)
					])
				])
			]);

			const node = new Node(object);

			const found = node.find(findPredicate);
			const item = await found.getItem();

			expect(item).toBe(find);
		});


		test('find searches breadth first', async () => {
			const find = createObject(findName);
			const object = createObject('Item', [
				createObject('Child', [
					createObject(findName)
				]),
				find
			]);

			const node =  new Node(object);

			const found = node.find(findPredicate);
			const item = await found.getItem();

			expect(item).toBe(find);
		});

	});

	describe('findSibling methods (findNextSibling, findPrevSibling)', () => {
		const getTree = async () => {
			const first = createObject('first-child');
			const second = createObject('second-child');
			const parent = new Node(createObject('parent', [
				first,
				second
			]));

			const children = await parent.getChildNodes();

			return {
				first: children[0],
				second: children[1],
				firstObject: first,
				secondObject: second
			};
		};

		describe('findNextSibling', () => {
			test('returns null if last in parent\'s children', async () => {
				const {second} = await getTree();

				const next = await second.findNextSibling();

				await expect(next.isEmptyNode()).resolves.toBeTruthy();
			});

			test('returns next sibling', async () => {
				const {first, secondObject} = await getTree();

				const next = await first.findNextSibling();
				const item = await next.getItem();

				expect(item).toBe(secondObject);
			});
		});

		describe('findPrevSibling', () => {
			test('returns null if last in parent\'s children', async () => {
				const {first} = await getTree();

				const prev = await first.findPrevSibling();

				await expect(prev.isEmptyNode()).resolves.toBeTruthy();
			});

			test('returns prev sibling', async () => {
				const {firstObject, second} = await getTree();

				const prev = await second.findPrevSibling();
				const item = await prev.getItem();

				expect(item).toBe(firstObject);
			});
		});
	});
});
