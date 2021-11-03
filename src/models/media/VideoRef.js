import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

export default class VideoRef extends Base {
	static MimeType = COMMON_PREFIX + 'ntivideoref';

	constructor(service, parent, data) {
		super(service, parent, data);

		console.debug('What is this?', this); //eslint-disable-line no-console
	}
}

Registry.register(VideoRef);
