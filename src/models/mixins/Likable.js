import pluck from '../../utils/pluck';

export default {
	like () {
		let link = this.hasLink('like') ? 'like' : 'unlike';
		return this.postToLink(link)
			.then(o => this.refresh(pluck(o, 'NTIID', 'Links', 'LikeCount', 'RecursiveLikeCount')))
			.then(() => this.onChange('like'));
	},


	favorite () {
		let link = this.hasLink('favorite') ? 'favorite' : 'unfavorite';
		return this.postToLink(link)
			.then(o => this.refresh(pluck(o, 'NTIID', 'Links')))
			.then(() => this.onChange('favorite'));
	},


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
};
