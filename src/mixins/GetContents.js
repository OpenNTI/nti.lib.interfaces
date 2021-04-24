import { URL } from '@nti/lib-commons';

import { NO_LINK, Service, Parser as parse } from '../constants.js';

export default Target =>
	class extends Target {
		async getContents(params, parseItems = true) {
			let link = this.getLink('contents');
			if (!link) {
				throw new Error(NO_LINK);
			}

			if (typeof params === 'object') {
				link = URL.appendQueryParams(link, params);
			}

			return this[Service].get(link).then(raw =>
				!parseItems
					? raw
					: {
							...raw,
							Items: this[parse](raw.Items),
					  }
			);
		}
	};
