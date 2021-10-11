import Registry from '../../Registry.js';
import Base from '../../Base.js';

/** @typedef {import('../../entities/User.js').default} User */

export class BaseEvent extends Base {
	static MimeType = '__base-event__';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'start_time': 			{ type: 'date', name: 'startTime' },
		'end_time': 			{ type: 'date', name: 'endTime' },
		'description': 			{ type: 'string' },
		'icon': 				{ type: 'string' },
		'location': 			{ type: 'string' },
		'title': 				{ type: 'string' },
		// Declaring CatalogEntry causes it to be serialized
		// 'CatalogEntry':     	{ type: 'model'  }, // not currently coming back inline, but we're decorating it client-side
		'CatalogEntryNTIID': 	{ type: 'string' },
		'ContainerId': 			{ type: 'string' },
		'RegistrationTime':     { type: 'date'   }
	}

	constructor(service, parent, data) {
		super(service, parent, data);

		this.addToPending(resolveCatalogEntry(service, this));
	}

	getUniqueIdentifier = () => this.getID();

	/**
	 *
	 * @param {User} user
	 */
	async recordAttendance(user) {
		const rel = 'record-attendance';
		if (!this.hasLink(rel)) {
			throw new Error(
				'This event does not support recording attendance.'
			);
		}

		await this.fetchLink({
			method: 'post',
			mode: 'raw',
			rel: rel,
			data: { Username: user.getID() },
		});
	}
}

Registry.register(BaseEvent);

async function resolveCatalogEntry(service, event) {
	const self = event;
	try {
		const { CatalogEntryNTIID: id, CatalogEntry } = event;

		if (!id || CatalogEntry) {
			return;
		}

		const entry = await service.getObject(id);

		self.CatalogEntry = entry;
		self.onChange('CatalogEntry');
	} catch (e) {
		//just swallow the error for now
	}
}
