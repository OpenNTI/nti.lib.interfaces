import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Model.js';

export default class LTIConfiguredTool extends Base {
	static MimeType = [COMMON_PREFIX + 'ims.consumer.configuredtool'];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'title': { type: 'string' },
		'description': { type: 'string' },
		'consumer_key': { type: 'string' },
		'secret': { types: 'string' },
		'launch_url': { types: 'string' },
		'secure_launch_url': { types: 'string' }
	};
}

Registry.register(LTIConfiguredTool);
