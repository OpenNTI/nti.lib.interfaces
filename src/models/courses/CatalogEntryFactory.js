import { defineProtected } from '@nti/lib-commons';

const DEFAULT_ADMIN_LEVEL_KEY = 'DefaultAPICreated';
const IMPORTED_LEVEL_KEY = 'DefaultAPIImported';

export default class CatalogEntryFactory {
	static from(service) {
		// hit creation API
		return new CatalogEntryFactory(service);
	}

	constructor(service) {
		Object.defineProperties(this, {
			...defineProtected({
				service,
				parse: o => service.getObject(o),
			}),
		});

		Object.assign(this, {
			DEFAULT_ADMIN_LEVEL_KEY,
			IMPORTED_LEVEL_KEY,
		});
	}

	async create(data, level) {
		const { service } = this;

		const adminLevelsURL = service
			.getWorkspace('Courses')
			.getLink('AdminLevels');
		const levels = await service.get(adminLevelsURL);
		const defaultLevel = await getLevel(
			service,
			adminLevelsURL,
			level,
			levels
		);
		const { NTIID } = await service.post(defaultLevel.href, data);
		const course = await service.getObject(NTIID);

		return course.CatalogEntry;
	}
}

// Private Utilities

function getLevel(service, adminLevelsURL, level, levels) {
	if (!levels || !levels.Items) {
		return Promise.reject('No AdminLevels found');
	}

	const levelName = level || DEFAULT_ADMIN_LEVEL_KEY;

	const defaultLevel = levels.Items[levelName];

	if (defaultLevel) {
		return Promise.resolve(defaultLevel);
	}

	return service.post(adminLevelsURL, { key: levelName });
}
