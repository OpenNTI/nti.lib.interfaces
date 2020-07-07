import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

class BaseReport extends Base {
	static MimeType = COMMON_PREFIX + 'reports.basereport'

	static Fields = {
		'description':     {type: 'string'},
		'title':           {type: 'string'},
		'supported_types': {type: 'string[]', name: 'supportedTypes'},
		'rel':             {type: 'string'},
		'contexts':        {type: 'object'}
	}
}

export default decorate(BaseReport, {with:[model]});
