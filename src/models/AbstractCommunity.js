import EventEmitter from 'events';

const ResolveChannelList = Symbol('Resolve Channel List Method');

export default class AbstractCommunity extends EventEmitter {
	static ResolveChannelList = ResolveChannelList;

	#channelListPromise = null;

	onChange () {
		this.emit('change');
	}

	async [ResolveChannelList] () {
		throw new Error('Implement async [AbstractCommunity.ResolveChannelList] () {}');
	}

	async getChannelList () {
		if (!this.#channelListPromise) {
			this.#channelListPromise = this[ResolveChannelList]();
		}

		return this.#channelListPromise;
	}

}
