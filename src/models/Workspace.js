import {model, COMMON_PREFIX} from './Registry';
import Base from './Base';
import Collection from './WorkspaceCollection';

export default
@model
class Workspace extends Base {
	static MimeType = COMMON_PREFIX + 'workspace'

	static Fields = {
		...Base.Fields,
		'Items': { type: Collection.List },
		'Title': { type: 'string'        },
	}

}
