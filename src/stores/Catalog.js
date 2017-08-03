import EventEmitter from 'events';

import {mixin} from 'nti-lib-decorators';
import {forward} from 'nti-commons';

import {Service} from '../constants';
import {Mixin as Pendability} from '../mixins/Pendability';
import {parseListFn} from '../models/Parser';


export default
@mixin(Pendability)
class Catalog extends EventEmitter {
	static load (service, reload) {
		return get(service, service.getCoursesCatalogURL(), reload)
			.then(data => {
				let catalog = new this(service, data);
				return catalog.waitForPending();
			});
	}

	constructor (service, data) {
		super();
		this.initMixins();
		this[Service] = service;

		Object.assign(this, data,
			forward(['every', 'filter', 'forEach', 'map', 'reduce'], 'Items'));

		this.onChange = this.onChange.bind(this);

		let parseList = parseListFn(this, service);

		this.Items = parseList(data.Items);
	}


	onChange () {
		this.emit('change', this);
	}


	findEntry (entryId) {
		let found;

		this.every(course => {
			if (course.getID() === entryId) {
				found = course;
			}

			return !found;
		});

		return found;
	}
}


function get (s, url, ignoreCache) {
	let cache = s.getDataCache();

	let cached = cache.get(url), result;
	if (!cached || ignoreCache) {
		result = s.get(url)
			.catch(()=>({titles: [], Items: []}))
			.then(data =>cache.set(url, data) && data);
	} else {
		result = Promise.resolve(cached);
	}

	return result;
}
