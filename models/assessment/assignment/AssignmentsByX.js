import {EventEmitter} from 'events';

import PageSource from '../../ListBackedPageSource';

const PRIVATE = new WeakMap();
const initPrivate = (x, o = {}) => PRIVATE.set(x, o);
const getPrivate = x => PRIVATE.get(x);

const getItems = x => (getPrivate(x).groups || []);

const flatten = groups => groups ? groups.reduce((a, g) => a.concat(g.items), []) : [];

export default class AssignmentsByX extends EventEmitter {

	constructor (collection) {
		super();
		let data = {};
		initPrivate(this, data);

		let latest;

		collection.on('new-filter', work => {
			let token = latest = {};
			data.busy = true;
			this.emit('change');

			const uninterupted = () => token === latest;

			work
				.then(({groups, order, search}) =>
					uninterupted() ?
						Object.assign(data, {groups, order, search, busy: false}) :
						Promise.reject('Ignore'))

				//these will be skiped if the previous "then" returns the rejected promise.
				.then(() => data.pageSource = new PageSource(flatten(data.groups)))
				.then(() => this.emit('change'));
		});
	}


	get loading () { return getPrivate(this).busy; }
	get order () { return getPrivate(this).order; }
	get search () { return getPrivate(this).search; }
	get length () { return getItems(this).length; }


	map (...args) {
		return getItems(this).map(...args);
	}


	[Symbol.iterator] () {
		return getItems(this)[Symbol.iterator]();
	}
}
