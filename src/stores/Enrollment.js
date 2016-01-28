import getLink from '../utils/getlink';

import Library from './Library';

import {Service} from '../constants';

const GetLibrary = Symbol('Library Getter');


//TODO: There isn't enough here to warrent a whole heavy class. This should move to the catalog API on the app side.

export default class Enrollment {
	constructor (service) {
		this[Service] = service;
	}

	[GetLibrary] () {
		return Library.get(this[Service], 'Main');
	}

	isEnrolled (courseId) {
		return this[GetLibrary]().then(library => !!library.getCourse(courseId));
	}


	enrollOpen (catalogEntryId) {
		let service = this[Service];
		return service.post(service.getCoursesEnrolledURL(), {
			NTIID: catalogEntryId
		});
	}


	dropCourse (courseId) {

		return this[GetLibrary]()
			.then(library =>
				library.getCourse(courseId, true)
				|| Promise.reject(new Error('Course Not Found in Library. Not Enrolled?')))

			.then(course => course.drop());
	}


	redeemGift (purchasable, courseId, accessKey) {
		if (!purchasable) {
			throw new Error('Purchasable is a required argument');
		}

		if (purchasable.getLink) {
			console.error('Use model@getLink'); //eslint-disable-line no-console
		} else {
			console.error('purchasable needs to be a model'); //eslint-disable-line no-console
		}

		let link = getLink(purchasable, 'redeem_gift');
		if (!link) {
			return Promise.reject('Couldn\'t find the gift redemption link for the provided purchasable');
		}

		return this[Service].post(link, { ntiid: courseId, code: accessKey });
	}
}
