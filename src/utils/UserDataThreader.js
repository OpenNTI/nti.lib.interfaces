import Logger from '@nti/util-logger';
import { isEmpty } from '@nti/lib-commons';

export const PARENT = Symbol('Thread Links:Parent');
export const CHILDREN = Symbol('Thread Links:Children');

const logger = Logger.get('lib:UserDataThreader');

const identity = x => x;
const GETTERS = {
	TranscriptSummary: x => x.RoomInfo
};


/**
 * A filter decision function.  Filters out non-"Top Level" items.
 *
 * @param {Model} item A User Generated Data model instance (Note, Highlight, etc)
 * @param {string[]} ids All the IDs in the response.
 *
 * @return {boolean} Returns true if the item's references are not in the set of all ids.
 */
export function topLevelOnly (item, ids) {
	// I'm not convinced this will (in a single pass) filter out all non-top-level items.
	// It has fixed my initial case. Must test further.
	return item && (!item.references || item.references
		.filter(x => ids.includes(x))
		.length === 0
	);
}


/**
 * The user data comes back as a flat list. Relevant items from others, and all
 * the current users. We perform a filter to remove extranious items that would
 * be fetched by a 'replies' link, leaving only the nodes needed to generate a
 * placeholder node.
 *
 * The purpose of this function is to reduce the list down to the un-threadable
 * items and the Root items...where a Root item may have been deleted and only
 * its children remain. (hence threading will recreate the placeholder)
 *
 * @param {object[]} list All the user data for a container.
 *
 * @return {object[]} All the top-level user data, rootes, and placeholder roots.
 */
export function threadThreadables (list) {
	let A = [], B = []; //To sets. Lets call A non-threadable, and B threadable.

	for (let x of list) {
		//separate the wheat from the chaff...
		(x.isThreadable ? B : A).push(x);
	}

	//rejoin every body (after threading the threadables)
	return A.concat(thread(B));
}


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
		logger.warn('Not all items in data were threadable %o', data);
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
		if (o[CHILDREN].length === 0) {
			delete o[CHILDREN];
		}
	}

	prune(tree);
}


//Exported only for tests
export function buildItemTree (items, tree) {
	let threadables = {};
	logger.debug('Using list of objects', items);

	//Flatten an preexisting relationships of list into the array ignoring duplicates.
	function flattenNode (n, result) {
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

	logger.debug('Flattened list is ', list);

	logger.debug('Flattened list of size ', items.length, 'to flattened list of size', list.length);

	for (let r of list) {
		if (!r.placeholder) {
			tearDownThreadingLinks(r);
		}
	}

	list.forEach(function buildTree (r) {
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
				logger.debug('Generating placeholder for id: %o\t\tchild: %o', parent, oid);
				p = (tree[parent] = g.toParentPlaceHolder());
				buildTree(p);
			}

			p[CHILDREN] = p[CHILDREN] || {};
			p[CHILDREN][r.getID()] = r;

			r[PARENT] = p;
		}
	});
}


function prune (/*tree*/) {
	//until we decide we want to prune from the root down... this is a non-desired function. (we cannot have leaf
	// placeholders with the current threading algorithm.)
}


export function tearDownThreadingLinks (o) {
	delete o[PARENT];
	delete o[CHILDREN];
}
