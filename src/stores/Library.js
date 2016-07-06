import Logger from 'nti-util-logger';
import EventEmitter from 'events';

import mixin from 'nti-commons/lib/mixin';
import unique from 'nti-commons/lib/array-unique';

import {parseListFn} from '../models';
import Pendability from '../models/mixins/Pendability';

import {Service} from '../constants';

const logger = Logger.get('store:Library');
const getInstances = service => service.getDataCache().get('LibraryInstances', {}, true);

export default class Library extends EventEmitter {

	static load (service, name, reload) {
		function make (contentBundles, enrolledCourses, administeredCourses) {
			return new Library(service, name, contentBundles, enrolledCourses, administeredCourses);
		}

		const instances = getInstances(service);

		return (instances[name] = Promise.all([
			resolveCollection(service, service.getContentBundlesURL(), reload),
			resolveCollection(service, service.getCoursesEnrolledURL(), reload),
			resolveCollection(service, service.getCoursesAdministeringURL(), reload)
		])
			.then(data=> make(...data).waitForPending())
			.then(instance => instances[name] = instance)
			.catch(e=> {
				logger.error(e.stack || e.message || e);
				return Promise.reject(e);
			}));
	}


	static get (service, name, reload) {
		function reloading (i) { i.emit('reloading'); }

		const instance = getInstances(service)[name];

		if (instance) {
			if (!reload) {
				return instance.then ? instance : Promise.resolve(instance);
			}
			else if(instance.then) {
				instance.then(reloading);
			} else {
				reloading(instance);
			}
		}

		return this.load(service, name, reload);
	}


	static free (/*name*/) {
		//TODO: Implement cleanup.
	}


	constructor (service, name, contentBundles, enrolledCourses, administeredCourses) {
		super();
		mixin(this, Pendability);
		this[Service] = service;
		this.name = name;

		this.onChange = this.onChange.bind(this);

		let parseList = parseListFn(this, service);


		contentBundles = contentBundles.filter(o => {
			let invalid = !o.ContentPackages || !o.ContentPackages.length;
			if (invalid) {
				logger.warn('Bundle is empty. Missing packages. %o', o);
			}
			return !invalid;
		});


		this.bundles = parseList(contentBundles);
		this.courses = parseList(enrolledCourses);
		this.administeredCourses = parseList(administeredCourses);

		Object.defineProperty(this, 'packages', {
			get () {
				logger.error('Dead Property.');
				return [];
			}
		});
	}


	hasCatalog () {
		//Forget you saw this if statement. $AppConfig is not safe to
		// reference directly. This is for a Symmys Hack.

		if (typeof $AppConfig !== 'undefined') { //eslint-disable-line no-undef
			let {flags = {}} = $AppConfig; //eslint-disable-line no-undef
			if (flags.hideCatalog) {
				return false;
			}
		}

		return !!this[Service].getCoursesCatalogURL();
	}


	onChange () {
		this.emit('change', this);
	}


	getCourse (courseInstanceId, ignoreAdministeredCourses = false) {
		return this.findCourse(
			course=> course.getCourseID() === courseInstanceId,
			ignoreAdministeredCourses
		);
	}


	getPackage (packageId) {
		let courseBundles = [].concat(this.courses, this.administeredCourses)
			.map(course => course.CourseInstance.ContentPackageBundle);

		let bundles = [].concat(this.bundles, courseBundles);

		let referencedPackages = bundles.reduce((set, bundle) => set.concat(bundle.ContentPackages), []);

		let packs = unique([].concat(
				referencedPackages,
				bundles //Also search over Bundles as they have the same "interface" as Packages.
			));

		return packs.reduce((found, pkg)=>
			found || pkg.getID() === packageId && pkg, null);
	}


	findCourse (findFn, ignoreAdministeredCourses = false) {
		let admin = this.administeredCourses || [];
		let courses = this.courses || [];

		if (ignoreAdministeredCourses !== true) {
			courses = [].concat(admin).concat(courses);
		}

		let found;
		courses.every(course =>
			!(found = findFn(course) ? course : null));

		return found;
	}


	getLastEnrolledCourse () {
		const getDate = x => x ? x.getCreatedTime() : 0;
		const {courses = []} = this;
		const sortedCopy = courses.slice().sort((a, b)=> getDate(b) - getDate(a));
		return sortedCopy[0];
	}
}


function resolveCollection (s, url, ignoreCache) {
	let cache = s.getDataCache();

	if (!url) {
		return Promise.resolve([]);
	}

	let cached = cache.get(url), result;
	if (!cached || ignoreCache) {
		result = s.get(url)
			.catch(()=>({titles: [], Items: []}))
			.then(data => {
				cache.set(url, data);
				return data;
			});
	}
	else {
		result = Promise.resolve(cached);
	}

	return result.then(data => data.titles || data.Items);
}
