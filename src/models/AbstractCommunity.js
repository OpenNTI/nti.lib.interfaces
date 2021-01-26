import EventEmitter from 'events';

const ResolveChannelList = Symbol('Resolve Channel List Method');

export default class AbstractCommunity extends EventEmitter {
	static ResolveChannelList = ResolveChannelList;

	#channelListPromise = null;
	#channelList = [];

	[Symbol.iterator] () {
		this.getChannelList();
		return this.#channelList[Symbol.iterator]();
	}

	onChange () {
		this.emit('change');
	}

	async [ResolveChannelList] () {
		throw new Error('Implement async [AbstractCommunity.ResolveChannelList] () {}');
	}

	async getChannelList () {
		if (!this.#channelListPromise) {
			this.#channelListPromise = (async () => {
				const list = await this[ResolveChannelList]();
				this.#channelList = list;
				this.onChange();
				return list;
			})();
		}

		return this.#channelListPromise;
	}

}
