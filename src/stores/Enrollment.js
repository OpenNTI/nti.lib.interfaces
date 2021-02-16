import { Service } from '../constants';
import getLink from '../utils/getlink';

//TODO: There isn't enough here to warrent a whole heavy class. This should move to the catalog API on the app side.

export default class Enrollment {
	constructor(service) {
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
		const course = await this.getCourse(courseId);
		return course.PreferredAccess
			? course.PreferredAccess.drop()
			: Promise.reject(new Error('Not Enrolled?'));
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
