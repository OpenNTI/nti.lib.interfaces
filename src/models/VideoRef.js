import Base from './Base';

export default class VideoRef extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);

		console.debug('What is this?', this); //eslint-disable-line no-console
	}
}
