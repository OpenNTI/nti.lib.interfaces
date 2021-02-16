import EventEmitter from 'events';

const ResolveChannelList = Symbol('Resolve Channel List Method');

export default class AbstractCommunity extends EventEmitter {
	static ResolveChannelList = ResolveChannelList;

	#channelListPromise = null;
	#channelList = [];

	[Symbol.iterator]() {
		this.getChannelList();
		const list = this.#channelList;
		if (Array.isArray(list)) {
			return iterate(list);
		}
		return list[Symbol.iterator]();
	}

	get hasCompoundList() {
		const list = this.#channelList;
		return Array.isArray(list) && list.length > 1;
	}

	onChange() {
		this.emit('change');
	}

	async [ResolveChannelList]() {
		throw new Error(
			'Implement async [AbstractCommunity.ResolveChannelList] () {}'
		);
	}

	async getChannelList() {
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

function* iterate(input) {
	if (!input || !input[Symbol.iterator]) {
		yield input;
		return;
	}

	const it = input[Symbol.iterator]();
	let current;
	do {
		current = it.next();
		if (current.done) {
			continue;
		}

		yield* iterate(current.value);
	} while (!current.done);
}
