import {EventEmitter} from 'events';

import identity from '../utils/identity';
import mixin from '../utils/mixin';
import waitFor from '../utils/waitfor';
import unique from '../utils/array-unique';

import {parse} from '../models/Parser';
import Pendability from '../models/mixins/Pendability';

import {Pending, Service} from '../CommonSymbols';

let instances = {};

export function parseListFn (scope, service) {
	let m = o => {
		try {
			o = parse(service, null, o);
			scope.addToPending(o);
			if(o && o.on && scope.onChange) {
				o.on('changed', scope.onChange);
			}
		} catch(e) {
			console.error(e.stack || e.message || e);
			o = null;
		}

		return o;
	};

	return list=>list.map(m).filter(identity);
}

export default class Library extends EventEmitter {

	static load (service, name, reload) {
		let instance = instances[name];

		function make (contentPackages, contentBundles, enrolledCourses, administeredCourses) {
			return new Library(service, name, contentPackages, contentBundles, enrolledCourses, administeredCourses);
		}

		return (instances[name] = Promise.all([
			resolveCollection(service, service.getContentPackagesURL(), reload),
			resolveCollection(service, service.getContentBundlesURL(), reload),
			resolveCollection(service, service.getCoursesEnrolledURL(), reload),
			resolveCollection(service, service.getCoursesAdministeringURL(), reload)
		])
			.then(data=>waitFor((instance = make(...data))[Pending]))
			.then(()=>instances[name] = instance))
			.catch(e=> {
				console.error(e.stack || e.message || e);
				return Promise.reject(e);
			});
	}


	static get (service, name, reload) {
		function reloading(i) { i.emit('reloading'); }

		let instance = instances[name];

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


	constructor(service, name, contentPackages, contentBundles, enrolledCourses, administeredCourses) {
		super();
		mixin(this, Pendability);
		this[Service] = service;
		this.name = name;

		this.onChange = this.onChange.bind(this);

		let parseList = parseListFn(this, service);


		contentBundles = contentBundles.filter(o => {
			let invalid = !o.ContentPackages || !o.ContentPackages.length;
			if (invalid) {
				console.warn('%o Bundle is empty. Missing packages.', o);
			}
			return !invalid;
		});

		contentPackages = contentPackages.filter(pkg => !pkg.isCourse);

		this.packages = parseList(contentPackages);
		this.bundles = parseList(contentBundles);
		this.courses = parseList(enrolledCourses);
		this.administeredCourses = parseList(administeredCourses);
	}


	onChange () {
		this.emit('changed', this);
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
				this.packages,
				referencedPackages,
				bundles //Also search over Bundles as they have the same "interface" as Packages.
			));

		return packs.reduce((found, pkg)=>
			found || pkg.getID() === packageId && pkg, null);
	}


	findCourse(findFn, ignoreAdministeredCourses = false) {
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
}


function resolveCollection(s, url, ignoreCache) {
	let cache = s.getDataCache();

	if (!url) {
		return Promise.resolve([]);
	}

	let cached = cache.get(url), result;
	if (!cached || ignoreCache) {
		result = s.get(url)
			.catch(()=>({titles: [], Items: []}))
			.then(data =>cache.set(url, data) && data);
	}
	else {
		result = Promise.resolve(cached);
	}

	return result.then(data => data.titles || data.Items);
}
