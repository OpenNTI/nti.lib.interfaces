import { URL } from '@nti/lib-commons';

import { NO_LINK, Service, Parser as parse } from '../constants.js';

/**
 * @template {new (...args: any[]) => {}} T
 * @param {T} Base
 * @mixin
 */
export default Base =>
	class extends Base {
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
