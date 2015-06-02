import isEmpty from './isempty';

export const PARENT = Symbol('Thread Links:Parent');
export const CHILDREN = Symbol('Thread Links:Children');

const identity = x => x;
const GETTERS = {
	TranscriptSummary: x => x.RoomInfo
};


/**
 * Given a set of Threadables, in the form of bins of arrays or just an array,
 * this will return an array of Threadable trees.
 *
 * @param {object|array} data Something to thread. @see getData
 *
 * @return {array} An array of Threadable trees. (Threadables that are roots to their trees)
 */
export function thread (data) {
	data = getData(data);
	let tree = {};

	if (data && data.every(x=> x.isThreadable)) {
		buildItemTree(data, tree);
		cleanupTree(tree);
	}
	else {
		console.warn('Not all items in data were threadable', data);
	}


	return Object.values(tree);
}

/**
 * Returns an array of objects to thread.
 *
 * @param {object|array} data Can be a single Threadable, an array of Threadables, or bins of Threadables.
 *
 * @return {array} Objects ready to thread
 */
function getData (data) {
	let isArray = Array.isArray(data);
	let bins = !isArray && Object.keys(data);
	let isBins = bins && bins.every(x => Array.isArray(data[x]));

	return isArray ?
				data :
				isBins ?
					bins.reduce((o, x) => o.concat(x), []) :
					[data];
}


//Exported only for tests
export function cleanupTree (tree) {
	//take all children off the main collection... make them accessible only by following the children pointers.
	for (let k of Object.keys(tree)) {
		let o = tree[k] || {};

		//turn children object into array
		o[CHILDREN] = Array.isArray(o[CHILDREN]) ?
						o[CHILDREN] :
						typeof o[CHILDREN] === 'object' ? Object.values(o[CHILDREN]) : void 0;

		if (o[PARENT]) { delete tree[k]; }
	}

	prune(tree);
}


//Exported only for tests
export function buildItemTree (items, tree) {
	let threadables = {};
	//console.group("Build Tree");
	//console.log('Using list of objects', items);

	//Flatten an preexisting relationships of list into the array ignoring duplicates.
	function flattenNode(n, result) {
		if (!n.placeholder) {
			result[n.getID()] = n;
		}

		if (!isEmpty(n[CHILDREN])) {
			for(let kid of n[CHILDREN]) {
				flattenNode(kid, result);
			}
		}
	}

	for (let n of items) {
		flattenNode(n, threadables);
	}

	let list = Object.values(threadables);

	//console.log('Flattened list is ', list);

	console.log('Flattened list of size ', items.length, 'to flattened list of size', list.length);

	for (let r of list) {
		if (!r.placeholder) {
			tearDownThreadingLinks(r);
		}
	}

	list.forEach(function buildTree(r) {
		let g = (GETTERS[r.Class] || identity)(r);
		let oid = g.getID(),
			parent = g.inReplyTo;

		r[CHILDREN] = r[CHILDREN] || {};

		if (!tree.hasOwnProperty(oid)) {
			tree[oid] = r;
		}

		if (parent) {
			let p = tree[parent];
			if (!p) {
				p = (tree[parent] = threadables[parent]);
			}
			if (!p) {
				//console.log('Generating placeholder for id:',parent, '  child:',oid);
				p = (tree[parent] = g.toParentPlaceHolder());
				buildTree(p);
			}

			p[CHILDREN] = p[CHILDREN] || {};
			p[CHILDREN][r.getID()] = r;

			r[PARENT] = p;
		}
	});

	// console.groupEnd("Build Tree");
}


function prune (/*tree*/) {
	//until we decide we want to prune from the root down... this is a non-desired function. (we cannot have leaf
	// placeholders with the current threading algorithm.)
}


export function tearDownThreadingLinks (o) {
	delete o[PARENT];
	delete o[CHILDREN];
}
