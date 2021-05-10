import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class CompletableItemDefaultRequiredPolicy extends Base {
	static MimeType = [COMMON_PREFIX + 'completion.defaultrequiredpolicy'];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'mime_types': { type: 'string[]', name: 'mimeTypes' }
	}
}

Registry.register(CompletableItemDefaultRequiredPolicy);
