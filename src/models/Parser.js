import Logger from '@nti/util-logger';

import {MODEL_INSTANCE_CACHE_KEY} from '../constants';

import Registry from './Registry';

const logger = Logger.get('models:Parser');

function getConstructorArgumentLength (o) {
	return !o ? 0 : (o.length || getConstructorArgumentLength(Object.getPrototypeOf(o)));
}


export function parse (service, parent, obj) {
	if (obj == null) {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map(o => {
			try {
				o = parse(service, parent, o);
			}
			catch (e) {
				if (!e.NoParser) {
					throw e;
				}
				logger.warn(e.message);
				return null;
			}
			return o;
		});
	}

	if (Object.getPrototypeOf(obj) !== Object.getPrototypeOf({})) {
		let message = 'Attempting to parse somthing other than an object-literal';
		logger.error('%s %o', message, obj);
		throw new Error(message);
	}

	let Cls = getModelByType(getType(obj));
	let args = [service];

	if (Cls && Cls.parse.length > 2) {
		args.push(parent);
	}

	args.push(obj);

	return Cls ? Cls.parse(...args) : error(obj);
}


export function parseListFn (scope, service, parent = null) {
	let m = o => {
		try {
			o = parse(service, parent, o);
			scope.addToPending(o);
			if(o && o.on && scope.onChange) {
				o.on('change', scope.onChange);
			}
		} catch(e) {
			logger.error(e.stack || e.message || e);
			o = null;
		}

		return o;
	};

	return list=>list.map(m).filter(x => x);
}


//Basic managed-instance tracker (invoke with .call or .apply!!)
function trackInstances (service, data, make) {
	const MOD_TIME = 'Last Modified';
	const cache = service.getDataCache();
	const map = cache.get(MODEL_INSTANCE_CACHE_KEY, {}, true);
	const {NTIID: id} = data;

	let inst = map[id];
	if (!inst) {
		inst = map[id] = make();
	}
	else {
		if (!inst.getLastModified() || !data[MOD_TIME] || data[MOD_TIME] * 1000 >= inst.getLastModified()) {
			inst.refresh(data);
		}
	}

	return inst;
}


//Default Constructor
function ConstructorFunc (service, parent, data) {
	const Ctor = this;
	const useParent = getConstructorArgumentLength(Ctor) > 2;
	const make = ()=> useParent ? new Ctor(service, parent, data) : new Ctor(service, data);

	return (this.prototype.isPrototypeOf(data))
		? data
		: this.trackInstances
			? trackInstances.call(this, service, data, make)
			: make();
}


function getModelByType (type) {
	const p = Registry.lookup(type);

	if (p && !p.parse) {
		p.parse = ConstructorFunc;
	}

	return p;
}


function getType (o) {
	let type = o.MimeType || o.mimeType;
	if (!type) {
		type = o.Class;
		if (type) {
			logger.error('Object does not have a MimeType and has fallen back to Class name resolve: ' + type, JSON.stringify(o).substr(0, 50));
		} else {
			logger.error('Object does not have an identity', o);
		}
	}
	return type;
}


function error (obj) {
	let e = new Error('No Parser for object: ' + (obj && getType(obj)) + '\n' + JSON.stringify(obj).substr(0, 100));
	e.NoParser = true;
	throw e;
}
