import EventEmitter from 'events';

import Logger from '@nti/util-logger';
import {URL, defineProtected} from '@nti/lib-commons';

import getLink from '../utils/getlink';


const logger = Logger.get('store:Library');
const getInstances = service => service.getDataCache().get('LibraryInstances', {}, true);

export default class Library extends EventEmitter {

	static get (service, name, reload) {
		const instances = getInstances(service);
		const instance = instances[name];

		if (instance) {
			if (!reload) {
				return instance;
			}

			instance.emit('reloading');
		}

		return (
			instances[name] = new Library(service, name)
		);
	}


	static free (service, name) {
		const instances = getInstances(service);
		delete instances[name];
	}


	constructor (service, name) {
		super();

		Object.defineProperties(this, {
			...defineProtected({
				name,
				service,
				parse: o => service.getObject(o, {parent: this}),
			})
		});

		this.load();
	}


	hasCatalog () {
		//Forget you saw this if statement. $AppConfig is not safe to
		// reference directly. This is for a Symmys Hack.

		if (typeof $AppConfig !== 'undefined') {
			let {flags = {}} = $AppConfig; //eslint-disable-line no-undef
			if (flags.hideCatalog) {
				return false;
			}
		}

		return !!this.service.getCoursesCatalogURL();
	}


	onChange = () => {
		this.emit('change', this);
	}


	getLastEnrolledCourse () {
		const getDate = x => x ? x.getCreatedTime() : 0;
		const {courses = []} = this;
		const sortedCopy = courses.slice().sort((a, b)=> getDate(b) - getDate(a));
		return sortedCopy[0];
	}


	async load () {
		this.loading = true;
		try {
			await Promise.all([
				loadCollection(this, this.service.getContentBundlesURL(), 'bundles', filterBadBundles),
				loadCollection(this, this.service.getCoursesEnrolledURL(), 'courses'),
				loadCollection(this, this.service.getCoursesAdministeringURL(), 'administeredCourses')
			]);
		} finally {
			this.loading = false;
			this.onChange();
		}
	}
}


async function loadCollection (scope, url, key, filter) {
	const {service} = scope;
	let list = scope[key] = [];

	url = URL.appendQueryParams(url, {batchSize: 10, batchStart: 0});

	do {

		const data = await loadPage(service, url, filter);
		const items = await scope.parse(data.Items);

		url = getLink(data, 'batch-next');

		list.push(...items);

		scope.onChange();

	} while (url);
}


async function loadPage (service, url, filter) {
	if (!url) {
		return [];
	}

	let data = {Items: []};
	try {
		data = await service.get(url);
		data.Items = (data.titles || data.Items).filter(filter || Boolean);
		delete data.titles;
	} catch (e) {
		logger.error(e);
	}

	return data;
}


function filterBadBundles (o) {
	let invalid = !o.ContentPackages || !o.ContentPackages.length;
	if (invalid) {
		logger.warn('Bundle is empty. Missing packages. %o', o);
	}
	return !invalid;
}
