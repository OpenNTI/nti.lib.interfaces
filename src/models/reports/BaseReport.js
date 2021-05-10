import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class BaseReport extends Base {
	static MimeType = COMMON_PREFIX + 'reports.basereport';

	// prettier-ignore
	static Fields = {
		'description':     {type: 'string'},
		'title':           {type: 'string'},
		'supported_types': {type: 'string[]', name: 'supportedTypes'},
		'rel':             {type: 'string'},
		'href':            {type: 'string'},
		'contexts':        {type: 'object'}
	}
}

Registry.register(BaseReport);
