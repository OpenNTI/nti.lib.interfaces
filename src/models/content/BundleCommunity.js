import { Channels } from '../community/index.js';
import AbstractCommunity from '../AbstractCommunity.js';
import { AutoSubscribable, Avatar, HasMembers } from '../community/traits.js';

export const ResolveChannelList = Symbol('ResolveChannelList');

export default class BundleCommunity extends AutoSubscribable(
	false,
	HasMembers(false, Avatar(false, AbstractCommunity))
) {
	static hasCommunity(bundle) {
		return bundle && bundle.Discussions;
	}

	static from(bundle) {
		if (!bundle || !bundle.Discussions) {
			return null;
		}

		return new BundleCommunity(bundle);
	}

	#bundle = null;
	#board = null;

	constructor(bundle) {
		super();

		this.#bundle = bundle;
		this.#board = bundle.Discussions;
	}

	getID() {
		return this.#bundle.getID();
	}

	get displayName() {
		return this.#board.title;
	}
	get about() {
		return this.#board.description;
	}

	canEdit() {
		return this.#board.hasLink('edit');
	}

	async save(data) {
		const payload = {};

		if (data.displayName != null) {
			payload.title = data.displayName;
		}
		if (data.about != null) {
			payload.description = data.about;
		}

		try {
			await this.#board.save(payload);
			this.onChange();
		} catch (e) {
			if (e.field === 'title') {
				e.field = 'displayName';
			}
			if (e.field === 'description') {
				e.field = 'about';
			}

			throw e;
		}
	}

	async [AbstractCommunity.ResolveChannelList]() {
		const channelList = await Channels.List.fromBoard(this.#board);

		return channelList;
	}
}
