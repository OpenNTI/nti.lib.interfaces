import Registry from '../../Registry.js';
import Base from '../../Base.js';

export default class BaseEvent extends Base {
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
		'CatalogEntryNTIID': 	{ type: 'string' },
		'ContainerId': 			{ type: 'string' }
	}

	constructor(service, parent, data) {
		super(service, parent, data);

		this.addToPending(resolveCatalogEntry(service, this));
	}

	getUniqueIdentifier = () => this.getID();
}

Registry.register(BaseEvent);

async function resolveCatalogEntry(service, event) {
	const self = event;
	try {
		const { CatalogEntryNTIID: id } = event;

		if (!id) {
			return;
		}

		const entry = await service.getObject(id);

		self.CatalogEntry = entry;
	} catch (e) {
		//just swallow the error for now
	}
}
