import JSONValue from '../mixins/JSONValue.js';
import Pendability from '../mixins/Pendability.js';
import Editable from '../mixins/Editable.js';
import HasLinks from '../mixins/HasLinks.js';
import { Parent, Service } from '../constants.js';

import Registry, { COMMON_PREFIX } from './Registry.js';
import { AbstractModel } from './AbstractModel.js';

/** @typedef {import('../utils/get-link.js').Link} Link */
/** @typedef {() => Date} DateGetter */

const CONTENT_VISIBILITY_MAP = { OU: 'OUID' };

export default class Model extends Pendability(
	Editable(JSONValue(HasLinks(AbstractModel)))
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
	};

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

		/** @type {string?} */
		this.Class;
		/** @type {string} */
		this.MimeType;
		/** @type {string} */
		this.OID;
		/** @type {string} */
		this.creator;
		/** @type {string} */
		this.href;
		/** @type {Link[]} */
		this.Links;
		/** @type {DateGetter} */
		this.getCreatedTime;
		/** @type {DateGetter} */
		this.getLastModifiedTime;
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

	getModel(...args) {
		return Registry.lookup(...args);
	}

	getID() {
		return this.NTIID;
	}

	async getContextPath() {
		return this[Service].getContextPathFor(this);
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
