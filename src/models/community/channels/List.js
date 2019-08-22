import EventEmitter from 'events';

import Channel from './Channel';

function validateChannels (channels) {
	if (!channels) { return true; }
	if (!Array.isArray(channels)) { throw new Error('Channels must be an array'); }
	if (!channels.every(c => c instanceof Channel)) { throw new Error('Channels must be an instance of the Channel class'); }

	return true;
}

export default class CommunityChannelList extends EventEmitter {
	#id = null
	#label = null
	#channels = null
	#createChannel = null

	constructor ({id, label, channels, createChannel}) {
		super();

		validateChannels(channels);

		this.#id = id;
		this.#label = label;
		this.#channels = channels;
		this.#createChannel = createChannel;
	}

	getID () { return this.#id; }

	get label () { return this.#label; }
	get channels () { return this.#channels; }

	get canCreateChannel () { return !!this.#createChannel; }

	async createChannel (title) {
		if (!this.canCreateChannels) { throw new Error('Cannot create a channel'); }
		
		const channel = await this.#createChannel(title);

		this.#channels = [...this.#channels, channel];
		this.emit('change');

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
}
