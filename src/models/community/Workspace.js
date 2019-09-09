import Workspace from '../Workspace';
import {Service} from '../../constants';
import {parseListFn} from '../Parser';

const CommunitiesCache = Symbol('CommunitiesCache');

export default class CommunitiesWorkspace extends Workspace {
	get AllCommunities () {
		return this.getCollection('AllCommunities');
	}

	get Communities () {
		return this.getCollection('Communities');
	}

	get AdminCommunities () {
		return this.getCollection('AdminCommunities');
	}

	fetch (url) {
		if (!this.url) { return this.load(true); } 

		return this[Service].get(url)
			.then(o => parseListFn(Object.values(o.Items || [])));
	}

	async load (force) {
		if (this[CommunitiesCache] && !force) { return this[CommunitiesCache]; }

		const {Communities} = this;
		const {Items: communities} = Communities ? await Communities.fetch() : {};
		
		return communities;
	}
}