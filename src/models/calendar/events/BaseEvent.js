import {decorate} from '@nti/lib-commons';

import { model } from '../../Registry';
import Base from '../../Base';

class BaseEvent extends Base {
	static MimeType = '__base-event__';

	static Fields = {
		...Base.Fields,
		'start_time': 			{ type: 'date', name: 'startTime' },
		'end_time': 			{ type: 'date', name: 'endTime' },
		'description': 			{ type: 'string' },
		'icon': 				{ type: 'string' },
		'location': 			{ type: 'string' },
		'title': 				{ type: 'string' },
		'CatalogEntryNTIID': 	{ type: 'string' },
		'ContainerId': 			{ type: 'string' }
	}

	constructor (service, parent, data) {
		super(service, parent, data);

		this.addToPending(resolveCatalogEntry(service, this));
	}

	getUniqueIdentifier = () => this.getID();
}

export default decorate(BaseEvent, {with:[model]});

async function resolveCatalogEntry(service, event) {
	const self = event;
	try {
		const {CatalogEntryNTIID:id} = event;

		if (!id) { return; }

		const entry = await service.getObject(id);

		self.CatalogEntry = entry;
	} catch (e) {
		//just swallow the error for now
	}
}
