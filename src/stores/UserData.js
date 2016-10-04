import Logger from 'nti-util-logger';

import EventEmitter from 'events';

import {mixin} from 'nti-commons';
import {threadThreadables, topLevelOnly} from '../utils/UserDataThreader';

import Pendability from '../models/mixins/Pendability';

import {Service, DELETED} from '../constants';

import {parseListFn} from '../models';


const logger = Logger.get('store:UserData');

const insert = Symbol();


export function binId (i, rootId) {
	let id = i.getContainerID ? i.getContainerID() : 'root';
	return id !== rootId ? binId : 'root';
}


export default class UserData extends EventEmitter {

	constructor (service, rootContainerId, source) {
		super();
		Object.assign(this, {
			[Service]: service,
			loading: true,
			rootId: rootContainerId
		});

		mixin(this, Pendability);
		this.onChange = this.onChange.bind(this);

		let parseList = parseListFn(this, service);
		let getBin = name => (this.Items[name] = (this.Items[name] || []));

		let pushUnique = (array, item) => array.map(x=>x.getID()).includes(item.getID()) ?
							logger.warn('Item is not unique in dataset:', item) :
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
				bin(binId(i, rootContainerId), i);
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

		if (process.browser) {
			this.on('load', (_, time) => logger.info('Load: %s %o', time, this));
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


	[insert] (item) {
		let bId = binId(item, this.rootId);
		let bin = this.Items[bId];
		if (!bin) {
			bin = this.Items[bId] = [];
		}

		if (item.isThreadable && item.isReply()) {
			return logger.warn('Inserting a reply!! Ignoring.');
		}

		//TODO: think through the scenario of if the item is a threadable, rethread? ignore replies?

		bin.push(item);

		item.on('change', this.onChange.bind(this));
		this.emit('change');
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
				logger.debug('Removed deleted item: %o', item);
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


	create (data) {
		let service = this[Service];
		let {href} = service.getCollectionFor(data.MimeType) || {};

		if (!href) {
			return Promise.reject('No Collection to post to.');
		}

		return service.postParseResponse(href, data)
			.then(x => {
				this[insert](x);
				return x;
			});
	}
}
