import EventEmitter from 'events';

import { Service } from '../constants.js';
import Fields, { hideField } from '../mixins/Fields.js';
import Heritage from '../mixins/Heritage.js';

/** @typedef {import('../stores/WebSocketClient').WebSocketClient} WebSocketClient */
/** @typedef {import('../utils/get-link.js').Link} Link */
/** @typedef {import('./Change').Change} Change */

class Observable extends EventEmitter {
	constructor() {
		super();

		this.setMaxListeners(100);
		//Make EventEmitter properties non-enumerable
		Object.keys(this).map(key => hideField(this, key));
	}
}

export class BaseObservable extends Heritage(Observable) {
	getEventPrefix() {
		return this.OID;
	}

	/**
	 * This does the work of emitting change and bubbling. The external part if this is `onChange`.
	 * Do not add service event emitters here. Local emits and parent only. Otherwise we can get
	 * into an infinite emit loop
	 *
	 * @param {...any} who
	 * @private
	 */
	_emitChange(...who) {
		this.emit('change', this, ...who);

		if (this.parent(x => x.constructor.ChangeBubbles)) {
			const what = [...who];
			const p = this.parent();

			const key = p?.findField(this);
			if (key) {
				what.unshift(key);
			}

			p?.onChange?.(...what);
		}
	}

	/**
	 * Notify all listeners that this model instance has changed.
	 *
	 * @param {...any} who
	 */
	onChange(...who) {
		this._emitChange(...who);

		const prefix = this.getEventPrefix();
		if (prefix) {
			this[Service]?.emit(`${prefix}-change`, this, ...who);
		}
	}

	/**
	 * Return the websocket client or null if the context can't have a socket.
	 *
	 * @protected
	 * @returns {WebSocketClient?}
	 */
	__getWebSocket() {
		try {
			return this[Service].getServer().getWebSocketClient();
		} catch {
			/* not available */
			return null;
		}
	}

	/**
	 * This function is called upon to determine if the incoming event is
	 * applicable to this model. Override if another selection criterion
	 * is necessary.
	 *
	 * Returning `true` from here will result in {@link __onSocketChangeEvent}
	 * being called with this change.
	 *
	 * @protected
	 * @param {Change} change
	 * @returns {boolean}
	 */
	__isSocketChangeEventApplicable(change) {
		return this.OID === change?.Item?.OID;
	}

	/**
	 * Emits an internal `socket-change` event which sub-classes/mixins may
	 * listen to. (There isn't a private event type so just know this event
	 * is meant for internal use only)
	 *
	 * It is intentional that this event can only fire if, and only if, there
	 * is an external subscriber to changes via {@link subscribeToChange}
	 *
	 * Because mixins and sub-classes may opt-into various changes, its
	 * important that the handlers of this event check that the change is the
	 * one they really care about. The {@link __isSocketChangeEventApplicable}
	 * may be extended to include other change types. (for example, the
	 * original implementation is opting into change events for a child
	 * CompletionItem, ...as in, both the CompletionItem and the parent object
	 * would receive the change for the CompletionItem if they both had change
	 * subscriptions)
	 *
	 * @private
	 * @param {Change} change
	 */
	__onSocketChangeEvent(change) {
		this.emit('incoming-change', change);
	}

	subscribeToChange(fn) {
		//NOTE: in the future if we need to subscribe to more than just the
		//change event, we can create a GlobalEventEmitter class and make the base
		//model extend that.
		const prefix = this.getEventPrefix();
		const event = `${prefix}-change`;
		const socket = this.__getWebSocket();

		const listener = async (item, ...args) => {
			if (item === this) {
				return fn(item, ...args);
			}

			if (
				prefix &&
				(item.getLastModified() > this.getLastModified() ||
					item.__isDirty())
			) {
				const refreshing = Symbol.for(
					'model:subscribeToChange:listener'
				);
				try {
					if (!this[refreshing]) {
						this[refreshing] = true;

						// If we need to change refresh, remember subclasses may
						// override refresh... change them too.
						await this.refresh(item);

						fn(this, ...args);
					}
				} finally {
					delete this[refreshing];
				}
			}
		};

		const incomingChange = async data => {
			/** @type {Change} Parse raw json into a change model */
			const change = await this[Service].getObject(data);
			if (this.__isSocketChangeEventApplicable(change)) {
				this.__onSocketChangeEvent(change);
			}
		};

		if (prefix) {
			this[Service].addListener(event, listener);
			socket?.addListener('data_noticeIncomingChange', incomingChange);
		}

		return () => {
			if (prefix) {
				this[Service].removeListener(event, listener);
				socket?.removeListener(
					'data_noticeIncomingChange',
					incomingChange
				);
			}
		};
	}
}

export class AbstractModel extends Fields(BaseObservable) {}
