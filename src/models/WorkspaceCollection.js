import {model, COMMON_PREFIX} from './Registry';
import Base from './Base';

export default
@model
class WorkspaceCollection extends Base {
	static MimeType = COMMON_PREFIX + 'workspace.collection'

	static Fields = {
		...Base.Fields,
		'Title': { type: 'string' },
	}

	static List (service, parent, items) {
		if (!Array.isArray(items)) {
			throw new TypeError('Invalid input, `items` sould be an array.');
		}

		return items.map(data => new WorkspaceCollection(service, parent, data));
	}

}
