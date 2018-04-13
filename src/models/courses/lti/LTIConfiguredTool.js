import { model, COMMON_PREFIX } from '../../Registry';
import Base from '../../Base';

export default
@model
class LTIConfiguredTool extends Base {
	static MimeType = [
		COMMON_PREFIX + 'ims.consumer.configuredtool',
	]

	static Fields = {
		...Base.Fields,
		'title': { type: 'string' },
		'description': { type: 'string' },
		'consumer_key': { type: 'string' },
		'secret': { types: 'string' },
		'launch_url': { types: 'string' },
		'secure_launch_url': { types: 'string' }
	}
}
