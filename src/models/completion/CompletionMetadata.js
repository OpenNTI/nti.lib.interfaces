import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class CompletionMetadata extends Base {
	static MimeType = [
		COMMON_PREFIX + 'completion.completionmetadata',
	]

	static Fields = {
		...Base.Fields,
		'FailCount':     { type: 'number'  },
		'SuccessCount':  { type: 'number'  },
		'ItemCount':     { type: 'number'  },
		'Items':  		 { type: 'model[]' }
	}

}
