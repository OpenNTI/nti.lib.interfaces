import EventEmitter from 'events';

import {mixin} from '@nti/lib-decorators';
import Logger from '@nti/util-logger';

import JSONValue from '../mixins/JSONValue';
import {Mixin as Pendability} from '../mixins/Pendability';
import Editable from '../mixins/Editable';
import Fields, {hideField} from '../mixins/Fields';
import HasLinks from '../mixins/HasLinks';
import {
	Parent,
	Service,
} from '../constants';

import Registry, {model} from './Registry';

const logger = Logger.get('models:Base');

const CONTENT_VISIBILITY_MAP = {OU: 'OUID'};

const PHANTOM = Symbol.for('Phantom');
const is = Symbol('isTest');


export default
@model
@mixin(HasLinks, JSONValue, Editable, Pendability, Fields)
class Base extends EventEmitter {
	static MimeType = '__base__'

	static Fields = {
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

	constructor (service, parent, data) {
		super();

		this.setMaxListeners(100);
		//Make EventEmitter properties non-enumerable
		Object.keys(this).map(key => hideField(this, key));

		// Allow null, and objects that declare they are a service.
		// Undefined and other falsy values are invalid.
		if (service !== null && (!service || service.isService !== Service)) {
			throw new Error('Invalid Service Document');
		}

		this[Service] = service;
		//only allow null, and lib-interface models as "parents"
		this[Parent] = (parent != null && parent[Service]) ? parent : null;


		if (this.initMixins) {
			this.initMixins(data);
		}
	}


	dispatch (...args) {
		this[Service].dispatch(...args);
	}


	get isCreatedByAppUser () {
		return this[Service].getAppUsername() === this.creator;
	}


	getCreatedTime () {} //implemented by Date Fields
	getLastModified () {} //implemented by Date Fields


	getModel (...args) {
		return Registry.lookup(...args);
	}


	getID () {
		return this.NTIID;
	}


	get isModifiable () {
		const maybeNewObject = !this.Links && !this.href;
		if (maybeNewObject && !this[PHANTOM]) {
			logger.warn('%s:\n\tObject declared Modifiable because it might be a new object... %o',
				'FIXME: Use item[Symbol.for(`Phantom`)] = true to declare this as a new object',
				this);
		}
		return this[PHANTOM] //declared a new object that has yet to be posted to the server
			|| this.hasLink('edit') //has an edit link.
			//TODO: remove this clause once all the warnings have been addressed.
			|| maybeNewObject; //or ambiguous case: its a new object? or not.
	}


	async getContextPath () {
		return this[Service].getContextPathFor(this);
	}


	onChange (who) {
		this.emit('change', this, who);
	}


	/**
	 * Returns the first parent that matches the given query. If no query is given, the immediate parent is returned.
	 *
	 * If only one argument is given, it will look for the first parent that has that attribute (ignoring value)
	 * If two argumetns are given, then it will look for the first parent that has that attribute and matches the
	 * attibuteValue test.
	 *
	 * @param {array} query The arguments:
	 *                      {string} query[0] attribute - The name of a property/attribute name.
	 *                      {string|RegExp} query[1] attributeValue - The (optional) value or value tester
	 *
	 * @returns {Model} The model that passes the test.
	 */
	parent (...query) {
		let p = this[Parent];

		if (p && typeof p.parent !== 'function' && p[Parent]) {
			p = p[Parent];
		}

		if (p && (query.length === 0 || (p[is] && p[is](...query)))) {
			return p;
		}

		return (p && typeof p.parent === 'function')
			? p.parent(...query)
			: void 0;
	}


	/**
	 * Returns a list of parents that match the given query. If no query is given, all parents are returned.
	 *
	 * @see #up()
	 *
	 * @param {array} query The arguments:
	 *                      {string} query[0] attribute - The name of a property/attribute name.
	 *                      {string|RegExp} query[1] attributeValue - The (optional) value or value tester
	 *
	 * @returns {Model[]} All the parents that match the query
	 */
	parents (...query) {
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


	reparent (newParent) {
		this[Parent] = newParent;
	}


	[is] (attributeQuery, attributeQueryValue) {
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


	hasVisibility (el, status) {
		function getProp (p) {
			let fn = ['getAttribute', 'get']
				.reduce((f, n) => f || el[n] && n, 0);
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
		return !attr || u.hasOwnProperty(attr) || attr === status || (/everyone/i).test(attr);
	}
}
