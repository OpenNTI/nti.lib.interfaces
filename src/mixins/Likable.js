import { pluck } from '@nti/lib-commons';

import { NO_LINK } from '../constants.js';

export default {
	like() {
		let link = this.hasLink('like') ? 'like' : 'unlike';
		return this.postToLink(link)
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
	},

	favorite() {
		let link = this.hasLink('favorite') ? 'favorite' : 'unfavorite';
		return this.postToLink(link)
			.then(o => this.refresh(pluck(o, 'NTIID', 'Links')))
			.then(() => this.onChange('favorite'));
	},

	async flag() {
		let link = this.hasLink('flag')
			? 'flag'
			: this.hasLink('flag.metoo')
			? 'flag.metoo'
			: null;

		if (!link) {
			throw new Error(NO_LINK);
		}

		return this.postToLink(link)
			.then(o => this.refresh(pluck(o, 'NTIID', 'Links')))
			.then(() => this.onChange('flag'));
	},
};
