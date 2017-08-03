import {pluck} from 'nti-commons';
import {mixin} from 'nti-lib-decorators';

import Threadable from '../../mixins/Threadable';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
@mixin(Threadable)
class MessageInfo extends Base {
	static MimeType = COMMON_PREFIX + 'messageinfo'

	constructor (service, parent, data) {
		super(service, parent, data);
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
