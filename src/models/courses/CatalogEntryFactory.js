import {defineProtected} from 'nti-commons';

const DEFAULT_ADMIN_LEVEL_KEY = 'DefaultAPICreated';

export default class CatalogEntryFactory {
	static from (service) {
		// hit creation API
		return new CatalogEntryFactory(service);
	}

	constructor (service) {
		Object.defineProperties(this, {
			...defineProtected({
				service,
				parse: o => service.getObject(o)
			})
		});
	}

	async create (data) {
		const {service} = this;

		const adminLevelsURL = service.getWorkspace('Courses').getLink('AdminLevels');
		const levels = await service.get(adminLevelsURL);
		const defaultLevel = await getDefaultLevel(adminLevelsURL, levels);
		const {NTIID} = await service.post(defaultLevel.href, data);
		const course = await service.getObject(NTIID);

		return course.CatalogEntry;
	}
}

// Private Utilities

function getDefaultLevel (service, adminLevelsURL, levels) {
	if(!levels || !levels.Items) {
		return Promise.reject('No AdminLevels found');
	}

	const defaultLevel = levels.Items[DEFAULT_ADMIN_LEVEL_KEY];

	if(defaultLevel) {
		return Promise.resolve(defaultLevel);
	}

	return service.post(adminLevelsURL, { key : DEFAULT_ADMIN_LEVEL_KEY });
}
