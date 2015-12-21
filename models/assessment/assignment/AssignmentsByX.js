import {EventEmitter} from 'events';

import PageSource from '../../ListBackedPageSource';

const PRIVATE = new WeakMap();
const initPrivate = (x, o = {}) => PRIVATE.set(x, o);
const getPrivate = x => PRIVATE.get(x);

const flatten = groups => groups && groups.reduce((a, g) => a.concat(g.items), []);

//ORDER_BY_COMPLETION, ORDER_BY_DUE_DATE, ORDER_BY_LESSON

const refresh = Symbol();

export default class AssignmentsByX extends EventEmitter {

	constructor (collection, defaultOrder) {
		super();
		let data = {collection, order: defaultOrder};
		initPrivate(this, data);

		let latest;

		const assertAndAssign = (o) => {
			Object.assign(data, o);
		};

		collection.on('new-filter', work => {
			let token = latest = {};
			data.busy = true;
			this.emit('change');

			const uninterupted = () => token === latest;

			work
				.then(({groups, order, search}) =>
					uninterupted() ?
						assertAndAssign({groups, order, search, busy: false}) :
						Promise.reject('Ignore'))

				//these will be skiped if the previous "then" returns the rejected promise.
				.then(() => data.pageSource = new PageSource(flatten(data.groups)))
				.then(() => this.emit('change'));
		});
	}


	get loading () { return getPrivate(this).busy; }
	get order () { return getPrivate(this).order; }
	get search () { return getPrivate(this).search; }
	get length () { return (getPrivate(this).groups || []).length; }

	setOrder (order) {
		Object.assign(getPrivate(this), {order});
		this[refresh]();
	}

	setSearch (search) {
		Object.assign(getPrivate(this), {search});
		this[refresh]();
	}


	[refresh] () {
		const {collection, order, search} = getPrivate(this);
		collection.getAssignmentsBy(order, search);
	}

	map (fn) {
		const out = [];
		let i = 0;

		for (let v of this) {
			out.push(fn(v, i++, this));
		}

		return out;
	}


	[Symbol.iterator] () {
		const {groups, busy} = getPrivate(this);

		if (!busy && groups == null) {
			this[refresh]();
		}

		return (groups || [])[Symbol.iterator]();
	}
}
