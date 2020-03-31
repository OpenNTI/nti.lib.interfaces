import EventEmitter from 'events';

const OnlineEvent = '__online-event';
const OfflineEvent = '__offline-event';

export default class OnlineStatus extends EventEmitter {
	#online = true;

	constructor () {
		super();
	}

	get isOnline () { return this.#online; }

	hadNetworkError () {
		const wasOnline = this.#online;

		this.#online = false;

		if (wasOnline) {
			this.emit(OfflineEvent);
		}
	}

	hadNetworkSuccess () {
		const wasOnline = this.#online;

		this.#online = true;

		if (!wasOnline) {
			this.emit(OnlineEvent);
		}
	}


	subscribeToChange (fn) {
		const callback = (...args) => {
			setTimeout(() => {
				fn(this.isOnline);
			}, 0);
		};

		this.addListener(OnlineEvent, callback);
		this.addListener(OfflineEvent, callback);

		return () => {
			this.removeListener(OnlineEvent, callback);
			this.removeListener(OfflineEvent, callback);
		};
	}
}