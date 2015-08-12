import {EventEmitter} from 'events';

import browser from '../utils/browser';
import mixin from '../utils/mixin';
import {thread} from '../utils/UserDataThreader';

import Pendability from '../models/mixins/Pendability';

import {Service, DELETED} from '../CommonSymbols';

import {parseListFn} from '../models';


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
	return item && (!item.references || item.references
		.filter(x => ids.includes(x))
		.length === 0
		);
}

/**
 * The user data comes back as a flat list. Relevant items from others, and all the current users.
 * We perform a filter to remove extranious items that would be fetched by a 'replies' link, leaving
 * only the nodes needed to generate a placeholder node.
 *
 * The purpose of this function is to reduce the list down to the un-threadable annotations (non-notes)
 * and the Root notes...where a Root note may have been deleted and only its children remain. (hence
 * threading will recreate the placeholder)
 *
 * @param {Annotation[]} list All the user data for a container.
 *
 * @return {Annotation[]} All the top-level user data, note rootes, and placeholder roots.
 */
function threadThreadables (list) {
	let A = [], B = []; //To sets. Lets call A non-threadable, and B threadable.

	for (let x of list) {
		//separate the wheat from the chaff...
		(x.isThreadable ? B : A).push(x);
	}

	//rejoin every body (after threading the threadables)
	return A.concat(thread(B));
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

			//Sort into container bins.
			for (let i of list) {
				let binId = i.getContainerID ? i.getContainerID() : 'root';
				bin(binId !== rootContainerId ? binId : 'root', i);
			}

			//merge some items under placeholders
			for (let i of Object.keys(this.Items)) {
				this.Items[i] = threadThreadables(this.Items[i]);
			}

			this.loaded = Date.now();
			this.emit('load', this, `${(this.loaded - start)}ms`);
			this.emit('change', this);
		});

		this.addToPending(load);

		if (browser) {
			this.on('load', (_, time) => console.log('Load: %s %o', time, this));
		}
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


	onChange (who, what) {
		if (what === DELETED) {

			for (let bin of Object.values(this.Items)) {

				let index = bin.findIndex(x => x.getID() === who.getID());
				if (index < 0) {
					continue;
				}

				let item = bin.splice(index, 1)[0];//remove it;

				item.removeListener('change', this.onChange);
				console.debug('Removed deleted item: %o', item);
			}
		}

		this.emit('change', this);
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
