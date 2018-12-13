import { model } from '../../Registry';
import Base from '../../Base';

export default
@model
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

	getUniqueIdentifier = () => this.getID();
}
