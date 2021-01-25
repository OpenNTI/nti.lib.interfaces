import EventEmitter from 'events';

import {Channels} from '../community';

export const ResolveChannelList = Symbol('ResolveChannelList');

export default class BundleCommunity extends EventEmitter {
	static hasCommunity (bundle) {
		return bundle && bundle.Discussions;
	}

	static from (bundle) {
		if (!bundle || !bundle.Discussions) { return null; }

		return new BundleCommunity(bundle);
	}

	#bundle = null
	#board = null
	#channelListPromise = null

	constructor (bundle) {
		super();

		this.#bundle = bundle;
		this.#board = bundle.Discussions;
	}

	isCommunity = true
	noAvatar = true
	hasMembers= false
	autoSubscribable = false

	getID () { return this.#bundle.getID(); }

	get displayName () { return this.#board.title; }
	get about () { return this.#board.description; }

	canEdit () {
		return this.#board.hasLink('edit');
	}

	async save (data) {
		const payload = {};

		if (data.displayName != null) { payload.title = data.displayName; }
		if (data.about != null) { payload.description = data.about; }

		try {
			await this.#board.save(payload);
			this.onChange();
		} catch (e) {
			if (e.field === 'title') { e.field = 'displayName'; }
			if (e.field === 'description') { e.field = 'about'; }

			throw e;
		}
	}

	onChange () {
		this.emit('change');
	}

	[ResolveChannelList] = async () => {
		const channelList = await Channels.List.fromBoard(this.#board);

		return channelList;
	}

	async getChannelList () {
		if (!this.#channelListPromise) {
			this.#channelListPromise = this[ResolveChannelList]();
		}

		return this.#channelListPromise;
	}
}
