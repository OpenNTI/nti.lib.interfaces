import {EventEmitter} from 'events';

import mixin from '../utils/mixin';

import Pendability from '../models/mixins/Pendability';

import {Service} from '../CommonSymbols';

import {parseListFn} from './Library';


/**
 * A filter decision function.  Filters out non-"Top Level" items.
 *
 * @param {Model} item A User Generated Data model instance (Note, Highlight, etc)
 * @param {string[]} ids All the IDs in the response.
 *
 * @return {boolean} Returns true if the item's references are not in the set of all ids.
 */
function topLevelOnly (item, ids) {
	// I'm not convinced this will (in a single pass) filter out all non-top-level items.
	// It has fixed my initial case. Must test further.
	return item.references
		.filter(x => ids.includes(x))
		.length === 0;
}


export default class UserData extends EventEmitter {

	constructor (service, rootContainerId, source) {
		super();
		Object.assign(this, {
			[Service]: service,
			loading: true
		});

		mixin(this, Pendability);


		let parseList = parseListFn(this, service);
		let getBin = name => (this.Items[name] = (this.Items[name] || []));

		let pushUnique = (array, item) => array.map(x=>x.getID()).includes(item.getID()) ?
							console.warn('Item is not unique in dataset:', item) :
							array.push(item);

		let bin = (name, item) => pushUnique(getBin(name), item);


		let start = Date.now();
		let load = service.get(source).then(data=> {
			this.loading = false;
			Object.assign(this, data);

			this.Items = {root: []};

			let list = parseList(data.Items);

			let ids = list.map(x => x.getID());
			list = list.filter(x => topLevelOnly(x, ids));

			this.OriginalTotal = this.Total;
			this.Total = list.length;

			for (let i of list) {
				let binId = i.getContainerID ? i.getContainerID() : 'root';
				bin(binId !== rootContainerId ? binId : 'root', i);
			}

			this.loaded = Date.now();
			this.emit('load', this, `${(this.loaded - start)}ms`);
		});

		this.addToPending(load);

		this.on('load', (_, time) => console.log('Load: %s %o', time, this));
	}


	[Symbol.iterator] () {
		let {Items = {}} = this,
			bins = Object.keys(Items),
			snapshot = bins.reduce((a, b)=> a.concat(Items[b] || []), []),
			index = 0;

		snapshot.sort((a, b) => b.getLastModified() - a.getLastModified());//show newest first.

		return {

			next () {
				let done = index >= snapshot.length;
				let value = snapshot[index++];

				return { value, done };
			}

		};
	}


	get (id) {
		for (let i of this) {
			if (i.getID() === id) {
				return i;
			}
		}
	}


	has (id) {
		return !!this.get(id);
	}
}
