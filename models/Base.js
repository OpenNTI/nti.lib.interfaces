import {EventEmitter} from 'events';

import {parse, getModelByType} from './Parser';

import getLink, {asMap as getLinksAsMap} from '../utils/getlink';
import mixin from '../utils/mixin';
import noop from '../utils/empty-function';
import waitFor from '../utils/waitfor';

import JSONValue from './mixins/JSONValue';

import {
	Parent,
	Service,
	ReParent,
	DateFields,
	Parser,
	Pending
} from '../CommonSymbols';


import parseDate from '../utils/parse-date';


let CONTENT_VISIBILITY_MAP = {OU: 'OUID'};

function dateGetter(key) {
	const symbol = Symbol.for(`parsedDate:${key}`);
	return function () {
		if (typeof this[symbol] !== 'object') {
			this[symbol] = parseDate(this[key]);
		}
		return this[symbol];
	};
}

function doParse(parent, data) {
	let service = parent[Service];

	try {
		return data && parse(service, parent, data);
	} catch (e) {
		let m = e;
		if (e.NoParser) {
			m = e.message;
		}
		console.warn(m.stack || m.message || m);
		return data;
	}
}

const PASCAL_CASE_REGEX = /(?:^|[^a-z0-9])([a-z0-9])?/igm;

const is = Symbol('isTest');

export default class Base extends EventEmitter {

	constructor (service, parent, data, ...mixins) {
		let dateFields = this[DateFields]();

		this[Service] = service;
		this[Parent] = parent;

		if (data) {
			Object.assign(this, data);
		}

		mixin(this, JSONValue);

		// mixin
		for (let partial of mixins) {
			mixin(this, partial, data);
		}

		let getMethod = x => 'get' + x.replace(
								PASCAL_CASE_REGEX,
								(_, c)=>(c || '').toUpperCase());

		for (let fieldName of dateFields) {
			let methodName = getMethod(fieldName);

			this[methodName] = dateGetter(fieldName);
		}
	}


	[DateFields] () {
		return [
			'CreatedTime',
			'Last Modified'
		];
	}


	addToPending (...pending) {
		let list = this[Pending] = (this[Pending] || []);

		list.push(...pending);

		function remove (p) {
			return ()=> {
				//remember JavaScript is not multi-threaded,
				// this action is effectively atomic... if that ever changes (it won't), this is not thread safe ;)
				let i = list.indexOf(p);
				if (i >= 0) {
					list.splice(i, 1);//remove promise from the array
				}
			};
		}

		for (let p of pending) {
			p.catch(noop)//prevent failures from interupting our cleanup
				.then(remove(p));
		}
	}


	waitForPending () {
		return waitFor(this[Pending]);
	}


	getModel (...args) {
		return getModelByType(...args);
	}


	[Parser] (raw) {

		if (raw === this) {
			throw new Error('Migration failure: something is calling parse with `this` as the first argument.');
		}


		let key;
		//If the param is:
		//	1) a string, and
		//	2) the value at that key on 'this' is an object, and
		//	3) that value is not a parsed object (model, instance of Base)
		if (typeof raw === 'string' && (typeof this[raw] === 'object' || this[raw] == null)) {
			key = raw;
			raw = this[key];

			if (raw && raw[Parser]) {
				console.error('Attempting to re-parse a model, aborting');
				return raw;
			}
		}

		let o = raw && doParse(this, raw);
		if (o && o[Pending]) {
			this.addToPending(...o[Pending]);
		}

		if (key) {//If the paramater was a key, assign the parsed object back to the key...
			this[key] = o;
			if (o == null || o.length===0) {
				delete this[key];
			}
		}
		return o;
	}


	refresh () {
		return this[Service].getObject(this.getID())
			.then(o => {
				if (this.NTIID !== o.NTIID) {
					throw new Error('Mismatch!');
				}

				for(let prop in o) {
					if (o.hasOwnProperty(prop)) {

						let current = this[prop];
						let value = o[prop];
						//We will assume if its an array, that we should parse it.
						if (current && (current[Service] || Array.isArray(current||value))) {
							try {
								value = this[Parser](value);
							} catch(e) {
								console.warn('Attempted to parse new value, and something went wrong... %o', e.stack||e.message||e);
							}
						}

						if (typeof current === 'function') {
							throw new Error('a value was named as one of the methods on this model.');
						}

						this[prop] = value;

					}
				}

				return this;
			});

	}


	getID () {
		return this.NTIID;
	}


	getLink (rel) {
		return getLink(this, rel);
	}


	getLinkMap () {
		return getLinksAsMap(this);
	}


	hasLink (rel) {
		return rel in this.getLinkMap() && !!this.getLink(rel);
	}


	fetchLink (rel) {
		let link = this.getLink(rel);
		if (!link) {
			return Promise.reject('No Link');
		}

		return this[Service].get(link);
	}


	fetchLinkParsed (rel) {
		return this.fetchLink(rel)
			.then(x=>this[Parser](x));
	}


	onChange (who) {
		this.emit('changed', this, who);
	}


	/**
	 * Returns the first parent that matches the given query. If no query is given, the immediate parent is returned.
	 *
	 * If only one argument is given, it will look for the first parent that has that attribute (ignoring value)
	 * If two argumetns are given, then it will look for the first parent that has that attribute and matches the
	 * attibuteValue test.
	 *
	 * @param  {String} attribute
	 * @param  {String|RegExp} [attributeValue]
	 *
	 * @return {Model}
	 */
	parent (...query) {
		let p = this[Parent];

		if (p && (query.length === 0 || p[is](...query))) {
			return p;
		}

		return p && p.parent(...query);
	}


	/**
	 * Returns a list of parents that match the given query. If no query is given, all parents are returned.
	 *
	 * @see #up()
	 *
	 * @param  {String} attribute
	 * @param  {String|RegExp} [attributeValue]
	 *
	 * @return {Model[]}
	 */
	parents (...query) {
		let matches = [];
		let p = this[Parent];

		if (p && p.parents) {

			matches = p.parents(...query);
			if (query.length === 0 || p[is](...query)) {
				matches.push(p);
			}
		}

		return matches;
	}


	[ReParent] (newParent) {
		this[Parent] = newParent;
	}


	[is] (attributeQuery, attributeQueryValue) {
		if (attributeQueryValue === undefined) {
			if (attributeQuery.test) {
				return attributeQuery.test(this);
			}

			return this[attributeQuery] !== undefined;
		}

		if (attributeQueryValue && attributeQueryValue.test) {
			return attributeQueryValue.test(this[attributeQuery]);
		}

		return this[attributeQuery] === attributeQueryValue;
	}


	hasVisibility (el, status) {
		function getProp(p) {
			let fn = ['getAttribute', 'get']
				.reduce(function(f, n) { return f || el[n] && n; }, 0);
			return (fn && el[fn](p)) || el[p];
		}


		let u = this[Service].getAppUserSync() || {},
			visibilityKey = getProp('visibility'),
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
