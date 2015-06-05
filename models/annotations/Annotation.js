import Base from '../Base';
// import {Parser} from '../../CommonSymbols';

function pluck(o, ...keys) {
	let out = {NTIID: o.NTIID};
	for (let key of keys) {
		out[key] = o[key];
	}
	return out;
}

export default class Annotation extends Base {

	constructor (service, parent, data, ...mixins) {
		super(service, parent, data, ...mixins);
	}


	getContainerID () {
		return this.ContainerId;
	}


	like () {
		let link = this.hasLink('like') ? 'like' : 'unlike';
		return this.postToLink(link)
			.then(o => this.refresh(pluck(o, 'Links', 'LikeCount', 'RecursiveLikeCount')))
			.then(() => this.onChange('like'));
	}


	favorite () {
		let link = this.hasLink('favorite') ? 'favorite' : 'unfavorite';
		return this.postToLink(link)
			.then(o => this.refresh(pluck(o, 'Links')))
			.then(() => this.onChange('favorite'));
	}
}
