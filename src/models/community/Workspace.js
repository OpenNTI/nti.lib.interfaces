import Workspace from '../Workspace';
import {Service} from '../../constants';
import {parseListFn} from '../Parser';
import Community from '../entities/Community';

const CommunitiesCache = Symbol('CommunitiesCache');

export default class CommunitiesWorkspace extends Workspace {
	get AllCommunities () {
		return this.getCollection('AllCommunities');
	}

	get Communities () {
		return this.getCollection('Communities');
	}

	get AdminCommunities () {
		return this.getCollection('AdministeredCommunities');
	}

	fetch (url) {
		if (!this.url) { return this.load(true); } 

		return this[Service].get(url)
			.then(o => parseListFn(Object.values(o.Items || [])));
	}

	async load (force) {
		if (this[CommunitiesCache] && !force) { return this[CommunitiesCache]; }

		const {Communities, AdminCommunities} = this;
		const {Items: communities} = Communities ? await Communities.fetch() : {};
		const {Items: adminCommunities} = AdminCommunities ? await AdminCommunities.fetch() : {};
		
		if (!communities && !adminCommunities) { return null; }

		const {ordered} = [...(communities || []), ...(adminCommunities || [])]
			.reduce((acc, community) => {
				if (!acc.seen.has(community.getID())) {
					acc.ordered.push(community);
				}

				acc.seen.add(community.getID());
				return acc;
			}, {ordered: [], seen: new Set()});

		return ordered;
	}


	canCreateCommunity () {
		return this.AllCommunities && this.AllCommunities.acceptsType(Community.MimeType);
	}


	async createCommunity (data) {
		const payload = {...data};

		if (data.displayName) {
			payload.alias = data.displayName;
			delete payload.displayName;
		}

		try {
			const community = await this.AllCommunities.postToLink('self', payload, true);

			delete this[CommunitiesCache];

			return community;
		} catch (e) {
			if (e.field === 'alias') { e.field === 'displayName'; }
			throw e;
		}
	}
}