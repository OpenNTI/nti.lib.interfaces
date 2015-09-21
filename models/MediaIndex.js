import {parse} from './';
import PageSourceModel from './MediaIndexBackedPageSource';
import {Service, Parent} from '../CommonSymbols';

import isEmpty from '../utils/isempty';
import urlJoin from '../utils/urljoin';

const PageSource = Symbol('PageSource');
const Order = Symbol('Order');
const Data = Symbol('Data');
const Containers = Symbol('Containers');

const getMedia = (s, i, v) => (v && v[Service]) ? v : parse(s, i, v);

export default class MediaIndex {

	static parse (service, parent, data, order, containers) {
		console.error('Where ?');
		return new MediaIndex(service, parent, data, order, containers);
	}


	static build (service, parent, orderProvider, json) {
		let keyOrder = [];
		let root = parent.root;

		function prefix (o) {
			o.src = urlJoin(root, o.src);
			o.srcjsonp = urlJoin(root, o.srcjsonp);
			return o;
		}

		function order (a, b) {
			let c = orderProvider.indexOf(a),
				d = orderProvider.indexOf(b),
				p = c > d;
			return p ? 1 : -1;
		}

		let containers = (json && json.Containers) || {};
		let keys = Object.keys(containers);

		try {
			keys.sort(order);
		} catch (e) {
			console.warn('Potentially unsorted: %o', e.stack || e.message || e);
		}

		keys.forEach(k => {
			let unique = containers[k].filter(i=> keyOrder.indexOf(i) === -1);
			keyOrder.push(...unique);
		});

		let vi = (json && json.Items) || json;

		for (let n in vi) {
			if (vi.hasOwnProperty(n)) {
				n = vi[n];
				if (n && !isEmpty(n.transcripts)) {
					n.transcripts = n.transcripts.map(prefix);
				}
			}
		}

		return new MediaIndex(service, parent, vi, keyOrder, containers);
	}


	static combine (list) {
		return !list || list.length === 0 ? null : list.reduce((a, b)=> a.combine(b));
	}


	constructor (service, parent, data, order, containers) {

		this[Service] = service;
		this[Parent] = parent;
		this[Order] = order || data[Order] || [];
		this[Data] = {};
		this[Containers] = containers;

		delete data[Order];

		for(let key in data) {
			if (data.hasOwnProperty(key)) {
				this[Data][key] = this.mediaFrom(data[key], this);
			}
		}
	}


	videoFrom (data, parent) {
		console.warn('Deprecated: Use mediaFrom instead.');
		return this.mediaFrom(data, parent);
	}


	mediaFrom (data, parent) {
		return getMedia(this[Service], parent, data);
	}


	get length () { return this[Order].length; }


	combine (that) {
		let order = this[Order].concat(that[Order]);
		let data = Object.assign({}, this[Data], that[Data]);
		let containers = Object.assign({}, this[Containers], that[Containers]);

		return new MediaIndex(this[Service], this[Parent], data, order, containers);
	}


	scoped (containerId) {
		let list = this[Containers][containerId] || [];
		return this.filter(o=>list.indexOf(o.getID()) >= 0);
	}


	filter (fn) {
		let data = {};
		let containers = {};

		let order = this[Order].filter((v, i, a) => {
			let o = this[Data][v];
			let pass = fn(o, i, a);
			if (pass) {
				data[v] = o;
			}
			return pass;
		});

		let has = x => x in data;

		for (let container of Object.keys(this[Containers])) {
			let list = this[Containers][container].filter(has);
			if (list.length > 0) {
				containers[container] = list;
			}
		}


		return new MediaIndex(this[Service], this[Parent], data, order, containers);
	}


	map (fn) {
		return this[Order].map((v, i, a) =>fn(this[Data][v], i, a));
	}


	reduce (fn, initial) {
		return this[Order].reduce((agg, v, i, a)=>fn(agg, this[Data][v], i, a), initial);
	}


	indexOf (id) { return this[Order].indexOf(id); }


	get (id) { return this[Data][id]; }


	getAt (index) {
		let id = this[Order][index];
		return id && this.get(id);
	}


	getPageSource () {
		if (!this[PageSource]) {
			this[PageSource] = new PageSourceModel(this);
		}

		return this[PageSource];
	}
}
