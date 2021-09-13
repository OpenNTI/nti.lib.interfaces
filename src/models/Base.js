import Logger from '@nti/util-logger';

import { JSONValue } from '../mixins/JSONValue.js';
import { mixin as Pendability } from '../mixins/Pendability.js';
import { mixin as Editable } from '../mixins/Editable.js';
import { mixin as Fields } from '../mixins/Fields.js';
import { mixin as HasLinks } from '../mixins/HasLinks.js';
import { Parent, Service } from '../constants.js';

import Registry, { COMMON_PREFIX } from './Registry.js';
import { BaseObservable } from './BaseObservable.js';

/** @typedef {import('../stores/WebSocketClient').WebSocketClient} WebSocketClient */
/** @typedef {import('./Change').Change} Change */

const logger = Logger.get('models:Base');

const CONTENT_VISIBILITY_MAP = { OU: 'OUID' };

const PHANTOM = Symbol.for('Phantom');
const is = Symbol('isTest');

export default class Model extends Pendability(
	Editable(JSONValue(HasLinks(Fields(BaseObservable))))
) {
	static MimeType = COMMON_PREFIX + '__base__';

	// prettier-ignore
	static Fields = {
		'Class':                  { type: 'string'                  },
		'Creator':                { type: 'string', name: 'creator' },
		'CreatedTime':            { type: 'date'                    },
		'Last Modified':          { type: 'date'                    },
		'NTIID':                  { type: 'string'                  },
		'MimeType':               { type: 'string'                  },
		'OID':                    { type: 'string'                  },
		//We don't want to parse Links, set its type to wild.
		'Links':                  { type: '*'                       },
		'href':                   { type: 'string'                  }
	}

	/**
	 *
	 * @param {import('../stores/Service.js').default} service
	 * @param {?Model} parent
	 * @param {*} data
	 */
	constructor(service, parent, data) {
		super(service, parent, data);

		// Allow null, and objects that declare they are a service.
		// Undefined and other falsy values are invalid.
		if (service !== null && (!service || service.isService !== Service)) {
			throw new Error('Invalid Service Document');
		}

		this[Service] = service;
		//only allow null, and lib-interface models as "parents"
		this[Parent] = parent != null && parent[Service] ? parent : null;
	}

	clone() {
		return new this.constructor(this[Service], this[Parent], this.toJSON());
	}

	dispatch(...args) {
		this[Service].dispatch(...args);
	}

	get isCreatedByAppUser() {
		return this.isAppUser(this.creator);
	}

	isAppUser(name) {
		return this[Service].getAppUsername() === name;
	}

	getCreatedTime() {} //implemented by Date Fields
	getLastModified() {} //implemented by Date Fields

	getModel(...args) {
		return Registry.lookup(...args);
	}

	getID() {
		return this.NTIID;
	}

	get isModifiable() {
		const maybeNewObject = !this.Links && !this.href;
		if (maybeNewObject && !this[PHANTOM]) {
			logger.warn(
				'%s:\n\tObject declared Modifiable because it might be a new object... %o',
				'FIXME: Use item[Symbol.for(`Phantom`)] = true to declare this as a new object',
				this
			);
		}
		return (
			this[PHANTOM] || //declared a new object that has yet to be posted to the server
			this.hasLink('edit') || //has an edit link.
			//TODO: remove this clause once all the warnings have been addressed.
			maybeNewObject
		); //or ambiguous case: its a new object? or not.
	}

	async getContextPath() {
		return this[Service].getContextPathFor(this);
	}

	getEventPrefix() {
		return this.OID;
	}

	onChange(...who) {
		this.emit('change', this, ...who);

		this[Service]?.emit(`${this.getEventPrefix()}-change`, this, ...who);

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
	 * is an external subscriber to changes vis {@link subscribeToChange}
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

			if (this.OID && item.getLastModified() >= this.getLastModified()) {
				if (this.applyChange) {
					await this.applyChange(item);
				} else {
					await this.refresh(item.toJSON());
				}

				fn(this, ...args);
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

	/**
	 * Returns the first parent that matches the given query. If no query is given, the immediate parent is returned.
	 *
	 * If only one argument is given, it will look for the first parent that has that attribute (ignoring value)
	 * If two argumetns are given, then it will look for the first parent that has that attribute and matches the
	 * attibuteValue test.
	 *
	 * @param {Array} query The arguments:
	 *                      {string} query[0] attribute - The name of a property/attribute name.
	 *                      {string|RegExp} query[1] attributeValue - The (optional) value or value tester
	 * @returns {Model} The model that passes the test.
	 */
	parent(...query) {
		let p = this[Parent];

		if (p && typeof p.parent !== 'function' && p[Parent]) {
			p = p[Parent];
		}

		if (p && (query.length === 0 || (p[is] && p[is](...query)))) {
			return p;
		}

		return p && typeof p.parent === 'function'
			? p.parent(...query)
			: void 0;
	}

	/**
	 * Returns a list of parents that match the given query. If no query is given, all parents are returned.
	 *
	 * @see #up()
	 * @param {Array} query The arguments:
	 *                      {string} query[0] attribute - The name of a property/attribute name.
	 *                      {string|RegExp} query[1] attributeValue - The (optional) value or value tester
	 * @returns {Model[]} All the parents that match the query
	 */
	parents(...query) {
		let matches = [];
		let p = this[Parent];

		if (p && p.parents) {
			matches = p.parents(...query);
			if (query.length === 0 || (p[is] && p[is](...query))) {
				matches.push(p);
			}
		}

		return matches;
	}

	reparent(newParent) {
		this[Parent] = newParent;
	}

	[is](attributeQuery, attributeQueryValue) {
		if (attributeQueryValue === undefined) {
			//like array::filter() callback...
			if (typeof attributeQuery === 'function') {
				return attributeQuery(this);
			}

			//RegExp::test()
			if (attributeQuery && attributeQuery.test) {
				return attributeQuery.test(this);
			}

			//fallback
			return this[attributeQuery] !== undefined;
		}

		//RegExp
		if (attributeQueryValue && attributeQueryValue.test) {
			return attributeQueryValue.test(this[attributeQuery]);
		}

		return this[attributeQuery] === attributeQueryValue;
	}

	hasVisibility(el, status) {
		function getProp(p) {
			let fn = ['getAttribute', 'get'].reduce(
				(f, n) => f || (el[n] && n),
				0
			);
			return (fn && el[fn](p)) || el[p];
		}

		let u = this[Service].getAppUserSync() || {},
			visibilityKey = el && getProp('visibility'),
			attr = CONTENT_VISIBILITY_MAP[visibilityKey] || visibilityKey;

		// NOTE: Some pieces of content within a course may have limited access (mainly on Copyright issues).
		// i.e only be available for OU students.
		// If the appUser doesn't have the visibility key or whatever it maps to,
		// then we conclude that they shouldn't have access to that content.
		// Right now, there is no great way to determine what that visibility key is or maps to.

		// For the short-term, since the request is for OU students and all 4-4 users(OU)
		// have a 'OUID' on the user record, we will check for its existence.
		// TODO: we need to define what this 'visibility' means for an AppUser in general (rather than just OU) or
		// have a convention on how have we resolve it.
		return (
			!attr ||
			Object.prototype.hasOwnProperty.call(u, attr) ||
			attr === status ||
			/everyone/i.test(attr)
		);
	}
}

// This probably doesn't need registering... but it was already being registered... so...
Registry.register(Model);
