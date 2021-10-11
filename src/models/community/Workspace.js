import Workspace from '../Workspace.js';
import { Service } from '../../constants.js';
import { parseListFn } from '../Parser.js';
import Community from '../entities/Community.js';

const CommunitiesCache = Symbol('CommunitiesCache');

export default class CommunitiesWorkspace extends Workspace {
	get AllCommunities() {
		return this.getCollection('AllCommunities');
	}

	get Communities() {
		return this.getCollection('Communities');
	}

	get AdminCommunities() {
		return this.getCollection('AdministeredCommunities');
	}

	fetch(url) {
		if (!this.url) {
			return this.load(true);
		}

		return this[Service].get(url).then(o =>
			parseListFn(Object.values(o.Items || []))
		);
	}

	load(force) {
		const doLoad = async () => {
			const { Communities, AdminCommunities } = this;
			const { Items: communities } = Communities
				? await Communities.fetch(true)
				: {};
			const { Items: adminCommunities } = AdminCommunities
				? await AdminCommunities.fetch(true)
				: {};

			if (!communities && !adminCommunities) {
				return null;
			}

			const { ordered } = [
				...(communities || []),
				...(adminCommunities || []),
			].reduce(
				(acc, community) => {
					if (!acc.seen.has(community.getID())) {
						acc.ordered.push(community);
					}

					acc.seen.add(community.getID());
					return acc;
				},
				{ ordered: [], seen: new Set() }
			);

			return ordered;
		};

		this[CommunitiesCache] =
			!this[CommunitiesCache] || force
				? doLoad()
				: this[CommunitiesCache];

		return this[CommunitiesCache];
	}

	canCreateCommunity() {
		return (
			this.AllCommunities &&
			this.AllCommunities.acceptsType(Community.MimeType)
		);
	}

	async createCommunity(data) {
		const payload = { ...data };

		if (data.displayName) {
			payload.alias = data.displayName;
			delete payload.displayName;
		}

		try {
			const community = await this.AllCommunities.fetchLink({
				rel: 'self',
				data: payload,
			});

			delete this[CommunitiesCache];

			return community;
		} catch (e) {
			if (e.field === 'alias') {
				e.field === 'displayName';
			}
			throw e;
		}
	}
}
