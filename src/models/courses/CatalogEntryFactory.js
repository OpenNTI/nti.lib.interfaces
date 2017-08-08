import {Service} from '../../constants';

const DEFAULT_ADMIN_LEVEL_KEY = 'DefaultAPICreated';

export default class CatalogEntryFactory {
	static from (service) {
		// hit creation API
		return new CatalogEntryFactory(service);
	}

	constructor (service) {
		this[Service] = service;
	}

	create (data) {
		const adminLevelsURL = this[Service].getWorkspace('Courses').getLink('AdminLevels');

		return this[Service].get(adminLevelsURL)
			.then((levels) => {
				return this.__getDefaultLevel(adminLevelsURL, levels);
			}).then((defaultLevel) => {
				return this[Service].post(defaultLevel.href, data);
			}).then((createdCourse) => {
				return this[Service].getObject(createdCourse.NTIID);
			}).then((course) => {
				return course.CatalogEntry;
			});
	}

	__getDefaultLevel (adminLevelsURL, levels) {
		if(!levels) {
			return Promise.reject('No AdminLevels found');
		}

		let defaultLevel = levels.Items[DEFAULT_ADMIN_LEVEL_KEY];

		if(defaultLevel) {
			return Promise.resolve(defaultLevel);
		}

		return this[Service].post(adminLevelsURL, { key : DEFAULT_ADMIN_LEVEL_KEY });
	}
}
