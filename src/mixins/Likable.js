import { pluck } from '@nti/lib-commons';

import { NO_LINK } from '../constants.js';

/**
 * @template {import('../constants').Constructor} T
 * @param {T} Base
 * @mixin
 */
export default Base =>
	class Likable extends Base {
		like() {
			return this.fetchLink({
				method: 'post',
				mode: 'raw',
				rel: this.hasLink('like') ? 'like' : 'unlike',
			})
				.then(o =>
					this.refresh(
						pluck(
							o,
							'NTIID',
							'Links',
							'LikeCount',
							'RecursiveLikeCount'
						)
					)
				)
				.then(() => this.onChange('like'));
		}

		favorite() {
			return this.fetchLink({
				method: 'post',
				mode: 'raw',
				rel: this.hasLink('favorite') ? 'favorite' : 'unfavorite',
			})
				.then(o => this.refresh(pluck(o, 'NTIID', 'Links')))
				.then(() => this.onChange('favorite'));
		}

		async flag() {
			let link = this.hasLink('flag')
				? 'flag'
				: this.hasLink('flag.metoo')
				? 'flag.metoo'
				: null;

			if (!link) {
				throw new Error(NO_LINK);
			}

			return this.fetchLink({ method: 'post', mode: 'raw', rel: link })
				.then(o => this.refresh(pluck(o, 'NTIID', 'Links')))
				.then(() => this.onChange('flag'));
		}
	};
