import {URL} from '@nti/lib-commons';

import {Service, Parser as parse} from '../constants';


export default {
	getContents (params) {
		let link = this.getLink('contents');
		if (!link) {
			return Promise.reject('No Link!?');
		}

		if (typeof params === 'object') {
			link = URL.appendQueryParams(link, params);
		}

		return this[Service].get(link)
			.then(raw =>
				Object.assign({},//assume `raw` is immutable
					raw,
					{
						Items: this[parse](raw.Items)
					}
				)
			);
	}
};
