import EventEmitter from 'events';

import {Paging} from 'nti-commons';

const PageSource = Paging.ListBackedPageSource;

const PRIVATE = new WeakMap();
const initPrivate = (x, o = {}) => PRIVATE.set(x, o);
const getPrivate = x => PRIVATE.get(x);

const flatten = groups => groups && groups.reduce((a, g) => a.concat(g.items), []);

//ORDER_BY_COMPLETION, ORDER_BY_DUE_DATE, ORDER_BY_LESSON

const refresh = Symbol();

function getGroups (x) {
	const {groups, busy} = getPrivate(x);

	if (!busy && groups == null) {
		x[refresh]();
	}

	return groups || [];
}

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


	get length () { return getGroups(this).length; }
	get loading () { return getPrivate(this).busy; }
	get order () { return getPrivate(this).order; }
	get pageSource () { return this.loading ? null : getPrivate(this).pageSource; }
	get search () { return getPrivate(this).search; }

	setOrder (order) {
		Object.assign(getPrivate(this), {order});
		this[refresh]();
	}

	setSearch (search) {
		Object.assign(getPrivate(this), {search});
		this[refresh]();
	}


	[refresh] () {
		const data = getPrivate(this);
		const {collection, order, search} = data;
		data.busy = true;
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
		return getGroups(this)[Symbol.iterator]();
	}
}
