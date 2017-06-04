import {model, COMMON_PREFIX} from './Registry';
import Base from './Base';

@model
export default class VideoRef extends Base {
	static MimeType = COMMON_PREFIX + 'ntivideoref'

	constructor (service, parent, data) {
		super(service, parent, data);

		console.debug('What is this?', this); //eslint-disable-line no-console
	}
}
