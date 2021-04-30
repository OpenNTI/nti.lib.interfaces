import EventEmitter from 'events';

import { Service } from '../constants.js';
import getLink from '../utils/get-link.js';

//TODO: There isn't enough here to warrent a whole heavy class. This should move to the catalog API on the app side.

export default class Enrollment extends EventEmitter {
	constructor(service) {
		super();
		this.setMaxListeners(100);
		this.service = service;
	}

	async isEnrolled(courseId) {
		try {
			const course = await this.getCourse(courseId);
			return Boolean(course.PreferredAccess);
		} catch (e) {
			return false;
		}
	}

	getCourse(courseId) {
		return this.service.getObject(courseId);
	}

	enrollOpen(catalogEntryId) {
		const { service } = this;
		return service.post(service.getCoursesEnrolledURL(), {
			NTIID: catalogEntryId,
		});
	}

	async dropCourse(courseId) {
		this.emit('beforedrop', { courseId });
		const course = await this.getCourse(courseId);
		let error;

		try {
			if (!course.PreferredAccess) {
				throw new Error('Not Enrolled?');
			}

			return await course.PreferredAccess.drop();
		} catch (e) {
			error = e;
			throw e;
		} finally {
			this.emit('afterdrop', { course, courseId, error });
		}
	}

	redeemGift(purchasable, courseId, accessKey) {
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
			return Promise.reject(
				"Couldn't find the gift redemption link for the provided purchasable"
			);
		}

		return this[Service].post(link, { ntiid: courseId, code: accessKey });
	}
}
