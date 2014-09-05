'use strict';

var Promise = global.Promise || require('es6-promise').Promise;

var merge = require('merge');
var EventEmitter = require('events').EventEmitter;

var withValue = require('../utils/object-attribute-withvalue');
var DataCache = require('../utils/datacache');
var identity = require('../utils/identity');
var waitFor = require('../utils/waitfor');

var Package = require('./content/Package');
var Bundle = require('./content/Bundle');
var Course = require('./courses/Enrollment');

function Library(service, name, contentPackages,
								contentBundles,
								enrolledCourses,
								administeredCourses) {

	Object.defineProperty(this, '_service', withValue(service));

	this.onChange = this.onChange.bind(this);

	var pending = this.__pending = [];

	function queue(p) {
		pending.push.apply(pending, p && p.__pending);
	}

	this.packages = contentPackages.map(function(pkg) {
		if (pkg.isCourse) {return null;}

		pkg = Package.parse(service, pkg);
		queue(pkg);
		pkg.on('changed', this.onChange);
		return pkg;
	}.bind(this)).filter(identity);//strip falsy items


	this.bundles = contentBundles.map(function(bdl) {
		if (!bdl.ContentPackages || !bdl.ContentPackages.length) {
			console.warn('Bundle is empty. Missing packages.')
			return null;
		}

		bdl = Bundle.parse(service, bdl);
		queue(bdl);
		bdl.on('changed', this.onChange);
		return bdl;
	}.bind(this)).filter(identity);//strip falsy items


	this.courses = enrolledCourses.map(function(course) {
		course = Course.parse(service, course);
		queue(course);
		course.on('changed', this.onChange);
		return course;
	}.bind(this)).filter(identity);//strip falsy items


	this.coursesAdmin = administeredCourses.map(function(course) {
		course = Course.parse(service, course, true);
		queue(course);
		course.on('changed', this.onChange);
		return course;
	}.bind(this)).filter(identity);//strip falsy items
}


merge(Library.prototype, EventEmitter.prototype, {

	onChange: function() {
		this.emit('changed', this);
	}
});


function get(s, url) {
	var cache = s.getDataCache();

	var cached = cache.get(url), result;
	if (!cached) {
		result = s.get(url)
			.catch(function empty () { return {titles: [], Items: []}; })
			.then(function(data) {
				cache.set(url, data);
				return data;
			});
	} else {
		result = Promise.resolve(cached);
	}

	return result.then(function(data) {
		return data.titles || data.Items;
	});
}


Library.load = function(service, name) {
	function make (contentPackages, contentBundles, enrolledCourses, administeredCourses) {
		return new Library(service, name, contentPackages, contentBundles, enrolledCourses, administeredCourses);
	}

	var library;

	return Promise.all([
		get(service, service.getContentPackagesURL()),
		get(service, service.getContentBundlesURL()),
		get(service, service.getCoursesEnrolledURL()),
		get(service, service.getCoursesAdministeringURL())
	]).then(function(data) {
		library = make.apply({}, data);
		return waitFor(library.__pending);
	}).then(function() {
		return library;
	});
}


module.exports = Library;
