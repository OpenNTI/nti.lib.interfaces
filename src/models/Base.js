import EventEmitter from 'events';
import Url from 'url';

import QueryString from 'query-string';
import {mixin, Parsing} from 'nti-commons';
import {ntiidEquals} from 'nti-lib-ntiids';
import Logger from 'nti-util-logger';

import JSONValue from '../mixins/JSONValue';
import {Mixin as Pendability} from '../mixins/Pendability';
import Editable from '../mixins/Editable';
import getLinkImpl from '../utils/getlink';
import {
	Parent,
	Service,
	ReParent,
	DateFields,
	Parser,
	RepresentsSameObject,
	NO_LINK
} from '../constants';

import {parse, getModelByType} from './index';


const logger = Logger.get('models:Base');

const CONTENT_VISIBILITY_MAP = {OU: 'OUID'};

const PASCAL_CASE_REGEX = /(?:^|[^a-z0-9])([a-z0-9])?/igm;

const TakeOver = Symbol.for('TakeOver');
const is = Symbol('isTest');

export default class Base extends EventEmitter {

	constructor (service, parent, data, ...mixins) {
		super();
		//Make EventEmitter properties non-enumerable
		this.setMaxListeners(100);
		for (let key of Object.keys(this)) {
			const desc = Object.getOwnPropertyDescriptor(this, key);
			desc.enumerable = false;

			delete this[key];
			Object.defineProperty(this, key, desc);
		}

		let dateFields = this[DateFields]();

		this[Service] = service;
		//only allow null, and lib-interface models as "parents"
		this[Parent] = (parent != null && parent[Service]) ? parent : null;

		if (data) {
			data = clone(data);
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


	get isCreatedByAppUser () {
		return this[Service].getAppUsername() === this.creator;
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
		const scope = this;
		const enumerable = !!y;
		const name = y || x;
		const value = scope[x];
		const renamedFrom = x !== name ? x : void 0;

		function deprecated () {
			let m = 'There is a new accessor to use instead.';

			if (typeof name === 'string') {
				m = `Use ${name} instead.`;
			}

			m = new Error(`Access to ${x} is deprecated. ${m}`);
			logger.error(m.stack || m.message || m);
			return scope[name];
		}

		if (scope[name] && x !== name) {
			logger.warn('%s is already defined.', name);
			return;
		}

		delete scope[x];

		setProtectedProperty(name, value, scope, enumerable, renamedFrom);

		if (x !== name) {
			deprecated.renamedTo = name;

			Object.defineProperty(scope, x, {
				enumerable: false,
				get: deprecated
			});
		}
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
			logger.error('Attempting to re-parse a model, aborting');
			return raw;
		}


		let o = raw && doParse(this, raw);
		if (o && o.addToPending) {
			this.addToPending(o);
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


	[RepresentsSameObject] (o) {
		return ntiidEquals(this.NTIID, o.NTIID, true/*ignore "specific provider" differences*/);
	}


	refresh (newRaw) {
		const service = this[Service];
		const INFLIGHT = 'Base:inflight-refresh';

		if (this[INFLIGHT]) {
			if (newRaw) {
				logger.debug('Waiting to refresh until previous refresh %o', this);
				return this[INFLIGHT].then(()=> this.refresh(newRaw));
			}

			logger.debug('Ignoring duplicate request to refresh. %o', this);
			return this[INFLIGHT];
		}
		logger.debug('Refresh %o', this);

		const fetch = newRaw ?
			Promise.resolve(newRaw) :
			this.href ?
				service.getObjectAtURL(this.href, this.getID()) :
				service.getObjectRaw(this.getID());

		const inflight = fetch.then(o => {
			if (!this[RepresentsSameObject](o)) {
				throw new Error('Mismatch!');
			}

			const MightBeModel = x=> !x || !!x[Service];
			const HasMimeType = x=>  x && (!!x.MimeType || !!x.Class);
			const Objects = x=> typeof x === 'object';
			const dateFields = this[DateFields]();

			for(let prop of Object.keys(o)) {
				let value = o[prop];

				//The property may have been remapped...
				let desc = Object.getOwnPropertyDescriptor(this, prop);
				let {renamedTo} = (desc || {}).get || {};
				if (renamedTo) {
					logger.debug('Refreshing renamed property: %s (%s)', prop, renamedTo);
					prop = renamedTo;
				}

				let current = this[prop];

				if (current === value) {
					continue;
				}

				//Reset the parsedDate cache.
				if (dateFields.includes(prop)) {
					delete this[getParsedDateKey(prop)];
				}

				//If the current value is truthy, and Model-like, then declare it to be a Model.
				let currentIsModel = current && MightBeModel(current);

				let currentMightBeListOfModels =
					current == null || //If the current value is empty, we cannot presume... the new value should shed some light.
					(Array.isArray(current) && current.every(MightBeModel)); //If the current value is an array, and each element of the array is Model-like...
					//then the current value Might be a list of models...

				let newValueHasMimeType = HasMimeType(value);

				//If the new value is an array and any item has a MimeType or Class, and its not Links (which don't have models yet...)
				let newValueMightBeListOfModels = Array.isArray(value) && prop !== 'Links' && value.some(HasMimeType);

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
					//or if the new value looks parsable
					newValueHasMimeType ||
					newValueMightBeListOfModels ||
					(
						//or the current value was unset, or a list of Models,
						currentMightBeListOfModels &&
						newValueIsArrayOfObjects//and our new value is a list of objects...
					)
				) {// then, yes... parse
					try {
						value = this[Parser](value);
					} catch(e) {
						logger.warn('Attempted to parse new value, and something went wrong... %o', e.stack || e.message || e);
					}
				}

				if (typeof current === 'function') {
					throw new Error('a value was named as one of the methods on this model.');
				}

				desc = Object.getOwnPropertyDescriptor(this, prop);
				if (desc && !desc.writable) {
					delete this[prop];
					setProtectedProperty(prop, value, this, desc.enumerable, (desc.get || {}).renamedFrom);
				} else {
					this[prop] = value;
				}

			}

			return this;
		});

		this[INFLIGHT] = inflight
			.catch((r) => (delete this[INFLIGHT], Promise.reject(r))) //swallow all errors so we can cleanup
			.then((r)  => (delete this[INFLIGHT], r));

		this.addToPending(inflight);

		return inflight;
	}


	getID () {
		return this.NTIID;
	}


	get isModifiable () {
		return this.hasLink('edit') || //has an edit link.
			//or its a new object that has yet to be posted to the server.
			(!this.Links && !this.href && this.getID() == null);
	}


	getContextPath () {
		return this.fetchLinkParsed('LibraryPath')
			.catch(reason =>
				(reason === NO_LINK)
					? this[Service].getContextPathFor(this.getID())
					: Promise.reject(reason));
	}


	getLink (rel, params) {
		let link = getLinkImpl(this, rel) || (rel === 'self' && this.href);

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


	hasLink (rel) {
		return !!this.getLink(rel);
	}


	fetchLinkParsed (rel, params) {
		return this.fetchLink(rel, params, true);
	}


	fetchLink (rel, params, parseResponse) {
		return this.requestLink(rel, 'get', void 0, params, parseResponse);
	}


	postToLink (rel, data, parseResponse) {
		return this.requestLink(rel, 'post', data, void 0, parseResponse);
	}


	putToLink (rel, data, parseResponse) {
		return this.requestLink(rel, 'put',data, void 0, parseResponse);
	}


	requestLink (rel, method, data, params, parseResponse) {

		const link = this.getLink(rel, params);
		if (!link) {
			return Promise.reject(NO_LINK);
		}

		let result = /^mock/i.test(link)
			? Promise.resolve(getLinkImpl(this, rel, true).result || Promise.reject('Bad Mock Data'))
			: this[Service][method](link, data);

		if (parseResponse) {
			result = parseResult(this, result);
		}

		return result;
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


	[ReParent] (newParent) {
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



/*** Utility private functions ***/


function clone (obj) {
	if (typeof obj !== 'object' || obj == null) {
		return obj;
	}

	const out = Array.isArray(obj) ? [] : {};
	for(let key of Object.keys(obj)) {
		out[key] = clone(obj[key]);
	}

	return out;
}


function GenEnumerabilityOf (obj, propName) {
	const desc = obj && Object.getOwnPropertyDescriptor(obj, propName);
	return desc && desc.enumerable;
}


function setProtectedProperty (name, value, scope, enumerable = GenEnumerabilityOf(scope, name), renamedFrom = null) {
	const get = () => value;

	let valueProperty = {writable: false, value};
	if (renamedFrom) {
		valueProperty = {get};
		Object.assign(get, {renamedFrom});
	}

	Object.defineProperty(scope, name, {
		configurable: true,
		enumerable,
		...valueProperty
	});
}


function getParsedDateKey (key) {
	return Symbol.for(`parsedDate:${key}`);
}


function dateGetter (key) {
	const symbol = getParsedDateKey(key);
	let last;
	return function () {
		if (typeof this[symbol] !== 'object' || this[key] !== last) {
			last = this[key];
			this[symbol] = Parsing.parseDate(last);
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
		logger.warn(m.stack || m.message || m);
		return data;
	}
}


function parseResult (scope, requestPromise) {
	const maybeWait = x => (x && x.waitForPending) ? x.waitForPending() : x;

	function selectItems (x) {
		const extract = x && x.Items && !x.MimeType;

		if (extract && x.Links) {
			logger.warn('Dropping Collection Links');
		}

		return extract ? x.Items : x;
	}

	return requestPromise
		.then(selectItems)
		.then(x=> scope[Parser](x))
		.then(o =>
			Array.isArray(o)
				? Promise.all( o.map(maybeWait) )
				: maybeWait(o)
		);
}
