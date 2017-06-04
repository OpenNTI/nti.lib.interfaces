import {pluck} from 'nti-commons';

import Threadable from '../../mixins/Threadable';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

@model
export default class MessageInfo extends Base {
	static MimeType = COMMON_PREFIX + 'messageinfo'

	constructor (service, parent, data) {
		super(service, parent, data, Threadable);
	}

	flag () {
		let link = this.hasLink('flag') ?
			'flag' :
			this.hasLink('flag.metoo') ?
				'flag.metoo' :
				null;

		if (!link) {
			return Promise.reject('No Link');
		}

		return this.postToLink(link)
			.then(o => this.refresh(pluck(o, 'NTIID', 'Links')))
			.then(() => this.onChange('flag'));
	}
}
