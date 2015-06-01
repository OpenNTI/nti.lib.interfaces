import isEmpty from './isempty';

export const PARENT = Symbol('Thread Links:Parent');
export const CHILDREN = Symbol('Thread Links:Children');

const GETTERS = {
	Highlight: x => x,
	Note: x => x,
	TranscriptSummary: x => x.RoomInfo,
	QuizResult: x => x,
	CommentPost: x => x,
	GeneralForumComment: x => x,
	PersonalBlogComment: x => x,
	ContentCommentPost: x => x
};


//TODO unify this function with buildThreads into one function taking a list of userdata and returning a new list where
// the threadable objects have been threaded.
export function thread (d) {
	let data = !Array.isArray(d) ? [d] : d,
		tree = {};

	if (data && data[0].isThreadable) {
		buildItemTree(data, tree);
	}

	cleanupTree(tree);

	return Object.values(tree);
}


//Expects an object with keys to arrays of threadables.
export function buildThreads (bins) {
	let tree = {};

	if (bins) {
		for (let o of Object.values(bins)) {
			if (o && o[0].isThreadable) {
				buildItemTree(o, tree);
			}
		}

		cleanupTree(tree);
	}

	return tree;
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
		let g = GETTERS[r.Class](r);
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
