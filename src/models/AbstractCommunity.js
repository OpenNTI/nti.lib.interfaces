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
			this.#channelListPromise = this[ResolveChannelList]()
				.then(list => {
					this.#channelList = list;
					this.onChange();
				});
		}

		return this.#channelListPromise;
	}

}
