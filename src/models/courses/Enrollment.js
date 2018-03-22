import {forward} from 'nti-commons';
import {mixin} from 'nti-lib-decorators';
import Logger from 'nti-util-logger';

import {
	Service,
	Parser as parse
} from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

import CourseIdentity from './mixins/CourseIdentity';
import EnrollmentIdentity from './mixins/EnrollmentIdentity';

const logger = Logger.get('models:courses:Enrollment');
const emptyFunction = () => {};
const EMPTY_CATALOG_ENTRY = {getAuthorLine: emptyFunction};

export default
@model
@mixin(
	CourseIdentity,
	EnrollmentIdentity,
	forward([
		'getEndDate',
		'getStartDate'
	//From:
	], 'CatalogEntry')
)
class Enrollment extends Base {
	static MimeType = [
		COMMON_PREFIX + 'courses.courseenrollment',
		COMMON_PREFIX + 'courseware.courseinstanceenrollment',
	]

	static Fields = {
		...Base.Fields,
		'CatalogEntry':           { type: 'model'   },
		'CourseInstance':         { type: 'object'  },
		'CourseProgress':         { type: 'model'   },
		'LegacyEnrollmentStatus': { type: 'string'  },
		'RealEnrollmentStatus':   { type: 'string'  },
		'Username':               { type: 'string'  },
		'UserProfile':            { type: 'model'   },
		'Reports':                { type: 'model[]' }
	}

	constructor (service, data) {
		super(service, null, data);

		this.addToPending(resolveCatalogEntry(service, this));
	}


	get title () {
		return this.CatalogEntry.Title;
	}


	get ProviderUniqueID () {
		return this.CatalogEntry.ProviderUniqueID;
	}


	getPresentationProperties () {
		//Called by library view... The version in Course Instance is called on by everything else.
		let cce = this.CatalogEntry || EMPTY_CATALOG_ENTRY;

		return {
			author: cce.getAuthorLine(),
			title: cce.Title,
			label: cce.ProviderUniqueID,
		};
	}


	drop () {
		return this[Service].delete(this.href);
	}


	getCourseID () {
		return this.CourseInstance.NTIID;
	}


	getTotalEnrollmentCount () {
		return this.CourseInstance.TotalEnrolledCount;
	}


	getStatus () {
		return this.LegacyEnrollmentStatus;
	}
}



async function resolveCatalogEntry (service, scope) {
	try {
		if (scope.CatalogEntry) {
			return;
		}

		// The intent and purpose of this cache is to transmit work done by the web-service to the the client...
		// We do NOT want to cache new entries on the client...and we should clear the cache on first read...
		const cache = service.getDataCache();
		const url = (((scope.CourseInstance || {}).Links || []).find(x => x.rel === 'CourseCatalogEntry') || {}).href;
		// const url = scope.getLink('CourseCatalogEntry');
		if (!url) {
			throw new Error('No CCE Link!');
		}

		const cached = cache.get(url);
		cache.set(url, null); //clear the cache on read...we only want to cache it for the initial page load.

		const cce = await (cached
			? Promise.resolve(cached)
			: service.get(url)
				.then(d => (!cache.isClientInstance && cache.set(url, d), d)));

		delete scope.CatalogEntry;
		const entry = scope.CatalogEntry = scope[parse](cce);

		return await entry.waitForPending();
	}
	catch (e) {
		let x = e.stack || e.message || e;
		let t = typeof x === 'string' ? '%s' : '%o';
		logger.warn('Enrollment: %s\nThere was a problem resolving the CatalogEntry!\n' + t,
			this.NTIID || this.OID,
			x);
	}
}
