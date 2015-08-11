import {EventEmitter} from 'events';

import Url from 'url';
import QueryString from 'query-string';

import {parse, getModelByType} from './';

import getLinkImpl, {asMap as getLinksAsMap} from '../utils/getlink';
import mixin from '../utils/mixin';

import JSONValue from './mixins/JSONValue';
import Pendability from './mixins/Pendability';
import Editable from './mixins/Editable';

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

function GenEnumerabilityOf (obj, propName) {
	let desc = obj && Object.getOwnPropertyDescriptor(obj, propName);
	return desc && desc.enumerable;
}

function dateGetter (key) {
	const symbol = Symbol.for(`parsedDate:${key}`);
	return function () {
		if (typeof this[symbol] !== 'object') {
			this[symbol] = parseDate(this[key]);
		}
		return this[symbol];
	};
}

function doParse (parent, data) {
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

const NO_LINK = 'No Link';
const PASCAL_CASE_REGEX = /(?:^|[^a-z0-9])([a-z0-9])?/igm;

const TakeOver = Symbol.for('TakeOver');
const SetProtectedProperty = Symbol.for('SetProtectedProperty');
const is = Symbol('isTest');

export default class Base extends EventEmitter {

	constructor (service, parent, data, ...mixins) {
		super();
		let dateFields = this[DateFields]();

		this[Service] = service;
		this[Parent] = parent;

		if (data) {
			data = JSON.parse(JSON.stringify(data));//deep clone
			Object.assign(this, data);
		}

		mixin(this, Editable);
		mixin(this, JSONValue);
		mixin(this, Pendability);

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

		if (this.hasOwnProperty('Creator')) {
			this[TakeOver]('Creator', 'creator');
		}
	}

	ensureProperty (name, isRequired, type, value) {
		if(isRequired && !this[name] || (this[name] && typeof this[name] !== type)) {
			throw new TypeError('Property constraints not met for field:' + name );
		}

		if (arguments.length > 3 && this[name] !== value) {
			throw new Error(`Required Property value for field ${name} is not met`);
		}
	}

	[DateFields] () {
		return [
			'CreatedTime',
			'Last Modified'
		];
	}


	[TakeOver] (x, y) {
		let scope = this;
		let enumerable = !!y;
		let name = y || x;
		let value = scope[x];

		function deprecated () {
			let m = 'There is a new accessor to use instead.';

			if (typeof name === 'string') {
				m = `Use ${name} instead.`;
			}

			m = new Error(`Access to ${x} is deprecated. ${m}`);
			console.error(m.stack || m.message || m);
			return scope[name];
		}

		if (scope[name] && x !== name) {
			console.warn('%s is already defined.', name);
			return;
		}

		delete scope[x];

		this[SetProtectedProperty](name, value, scope, enumerable);

		if (x !== name) {
			deprecated.renamedTo = name;

			Object.defineProperty(scope, x, {
				enumerable: false,
				get: deprecated
			});
		}
	}


	[SetProtectedProperty] (name, value, scope = this, enumerable = GenEnumerabilityOf(scope, name)) {
		Object.defineProperty(scope, name, {
			configurable: true,
			enumerable,
			writable: false,
			value
		});
	}


	getModel (...args) {
		return getModelByType(...args);
	}


	[Parser] (raw, defaultValueForKey) {

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
		}


		if (raw && raw[Parser]) {
			console.error('Attempting to re-parse a model, aborting');
			return raw;
		}


		let o = raw && doParse(this, raw);
		if (o && o[Pending]) {
			this.addToPending(...o[Pending]);
		}

		if (key) {//If the paramater was a key, assign the parsed object back to the key...
			this[key] = o;
			if (o == null || o.length === 0) {
				if (arguments.length > 1) {//a value was passed to the 2nd argument. (use its value no matter what it is.)
					this[key] = defaultValueForKey;
				} else {
					delete this[key];
				}
			}
		}
		return o;
	}


	refresh (newRaw) {

		let fetch = newRaw ?
			Promise.resolve(newRaw) :
			this[Service].getObject(this.getID());

		return fetch.then(o => {
			if (this.NTIID !== o.NTIID) {
				throw new Error('Mismatch!');
			}

			const MightBeModel = x=> !x || !!x[Service];
			const Objects = x=> typeof x === 'object';

			for(let prop in o) {
				if (o.hasOwnProperty(prop)) {
					let value = o[prop];

					//The property may have been remapped...
					let desc = Object.getOwnPropertyDescriptor(this, prop);
					let {renamedTo} = (desc || {}).get || {};
					if (desc && renamedTo) {
						prop = renamedTo;
					}

					let current = this[prop];

					if (current === value) {
						continue;
					}

					//If the current value is truthy, and Model-like, then declare it to be a Model.
					let currentIsModel = current && MightBeModel(current);

					let currentMightBeListOfModels =
						current == null || //If the current value is empty, we cannot presume... the new value should shed some light.
						(Array.isArray(current) && current.every(MightBeModel)); //If the current value is an array, and each element of the array is Model-like...
						//then the current value Might be a list of models...

					//Lets inspect the new value...
					let newValueIsArrayOfObjects =
						Array.isArray(value) && //If its an array,
						value.length > 0 && // and its length is greater than zero (there are things in it)
						value.every(Objects); // and every element is an Object
						//then the new value sould be parsed... as long as the current value is also parsed.

					//So, should we parse?
					if (
						//if the current value was a model,
						currentIsModel ||
						(
							//or the current value was unset, or a list of Models,
							currentMightBeListOfModels &&
							newValueIsArrayOfObjects//and our new value is a list of objects...
						)
					) {// then, yes... parse
						try {
							value = this[Parser](value);
						} catch(e) {
							console.warn('Attempted to parse new value, and something went wrong... %o', e.stack || e.message || e);
						}
					}

					if (typeof current === 'function') {
						throw new Error('a value was named as one of the methods on this model.');
					}

					desc = Object.getOwnPropertyDescriptor(this, prop);
					if (desc && !desc.writable) {
						delete this[prop];
						desc.value = value;

						Object.defineProperty(this, prop, desc);
					} else {
						this[prop] = value;
					}
				}
			}

			return this;
		});

	}


	getID () {
		return this.NTIID;
	}


	get isModifiable () {
		return this.hasLink('edit') || //has an edit link.
			//or its a new object that has yet to be posted to the server.
			(!this.Links && !this.href);
	}


	getContextPath () {
		return this.fetchLinkParsed('LibraryPath')
			.catch(reason =>
				(reason === NO_LINK)
					? this[Service].getContextPathFor(this.getID())
					: Promise.reject(reason));
	}


	getLink (rel, params) {
		let link = getLinkImpl(this, rel);

		if (link && params) {

			let url = Url.parse(link);
			url.search = QueryString.stringify(
							Object.assign(
								QueryString.parse(url.search),
								params));

			link = url.format();
		}

		return link;
	}


	getLinkMap () {
		return getLinksAsMap(this);
	}


	hasLink (rel) {
		return rel in this.getLinkMap() && !!this.getLink(rel);
	}


	fetchLink (rel, params) {
		let link = this.getLink(rel, params);
		if (!link) {
			return Promise.reject(NO_LINK);
		}

		return this[Service].get(link);
	}


	fetchLinkParsed (rel, params) {
		return this.fetchLink(rel, params)
			.then(x=> {
				if (x.Items && !x.MimeType) {
					if (x.Links) { console.warn('Dropping Collection Links'); }
					x = x.Items;
				}

				return x;
			})
			.then(x=> this[Parser](x));
	}


	postToLink (rel, data) {
		let link = this.getLink(rel);
		if (!link) {
			return Promise.reject('No Link');
		}

		return this[Service].post(link, data);
	}


	putToLink (rel, data) {
		let link = this.getLink(rel);
		if (!link) {
			return Promise.reject('No Link');
		}

		return this[Service].put(link, data);
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

		if (p && (query.length === 0 || (p[is] && p[is](...query)))) {
			return p;
		}

		return p && p.parent && p.parent(...query);
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
		function getProp (p) {
			let fn = ['getAttribute', 'get']
				.reduce((f, n) => f || el[n] && n, 0);
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
