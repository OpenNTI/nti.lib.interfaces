import EventEmitter from 'events';

import Channel from './Channel';

function validateChannels (channels) {
	if (!channels) { return true; }
	if (!Array.isArray(channels)) { throw new Error('Channels must be an array'); }
	if (!channels.every(c => c instanceof Channel)) { throw new Error('Channels must be an instance of the Channel class'); }

	return true;
}

export default class CommunityChannelList extends EventEmitter {
	static async fromBoard (board, label, getDefaultForumOverride) {
		const contents = await board.getContents();
		const channels = (contents.Items || []).reduce((acc, forum) => {
			if (forum.IsDefaultForum && getDefaultForumOverride) {
				const override = getDefaultForumOverride(forum);

				return override ? [...acc, override] : acc;
			}

			return [...acc, Channel.fromForum(forum)];
		}, []);

		const setOrder = board.isModifiable ?
			async (order) => {
				await board.save({'ordered_keys': order});
				return board.orderedKeys;
			} :
			null;

		const createChannel = board.canCreateForum() ?
			async (data) => {
				const forum = await board.createForum(data);
				return Channel.fromForum(forum);
			} :
			null;

		return new CommunityChannelList({
			id: board.getID(),
			label,
			channels,
			createChannel,
			setOrder
		});
	} 

	#id = null
	#label = null
	#channels = null
	#createChannel = null
	#setOrder = null

	constructor ({id, label, channels, createChannel, setOrder}) {
		super();

		validateChannels(channels);

		this.#id = id;
		this.#label = label;
		this.#channels = channels;
		this.#createChannel = createChannel;
		this.#setOrder = setOrder;
	}

	getID () { return this.#id; }

	get label () { return this.#label; }
	get channels () { return this.#channels; }

	get canCreateChannel () { return !!this.#createChannel; }
	async createChannel (data) {
		if (!this.canCreateChannel) { throw new Error('Cannot create a channel'); }
		
		const channel = await this.#createChannel(data);

		this.#channels = [...this.#channels, channel];

		return channel;
	}

	findChannel (predicate) {
		if (typeof predicate === 'string') {
			const match = predicate;
			predicate = (channel) => channel.getID() === match;
		}

		for (let channel of this.channels) {
			if (predicate(channel)) {
				return channel;
			}
		}

		return null;
	}

	get channelOrder () {
		return (this.channels || []).map(channel => channel.getID());
	}

	get canSetOrder () { return !!this.#setOrder; }
	async setOrder (order) {
		if (!this.canSetOrder) { throw new Error('Cannot set channel order'); }

		const newOrder = await this.#setOrder(order);
		const idMap = this.#channels.reduce((acc, channel) => {
			return {...acc, [channel.getID()]: channel};
		}, {});

		this.#channels = newOrder.map((id) => idMap[id]);

		return newOrder;
	}
}
