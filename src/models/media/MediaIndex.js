import { isEmpty, URL } from '@nti/lib-commons';
import Logger from '@nti/util-logger';

import { Service, Parent } from '../../constants.js';
import { parse } from '../Parser.js';

import PageSourceModel from './MediaIndexBackedPageSource.js';
import MediaSource from './MediaSource.js';
import Transcript from './Transcript.js';

const logger = Logger.get('lib:models:MediaIndex');

const PageSource = Symbol('PageSource');
const Order = Symbol('Order');
const Data = Symbol('Data');
const Containers = Symbol('Containers');

const getMedia = (s, i, v) => (v && v[Service] ? v : parse(s, i, v));

export default class MediaIndex {
	static parse(service, parent, data, order, containers) {
		logger.error('Where ?');
		return new MediaIndex(service, parent, data, order, containers);
	}

	static build(service, parent, orderProvider, json) {
		let keyOrder = [];
		let root = parent.root;

		function prefix(o) {
			o.src = URL.resolve(root || '', o.src);
			o.srcjsonp = o.srcjsonp
				? URL.resolve(root || '', o.srcjsonp)
				: o.srcjsonp;
			return o;
		}

		function applyTranscriptMimeType(transcript) {
			if (transcript && !transcript.MimeType) {
				transcript.MimeType = Transcript.MimeType;
			}

			return transcript;
		}

		function applySourceMimeType(source) {
			if (source && !source.MimeType) {
				source.MimeType = MediaSource.MimeType;
			}

			return source;
		}

		function order(a, b) {
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
			logger.warn('Potentially unsorted: %o', e.stack || e.message || e);
		}

		keys.forEach(k => {
			let unique = containers[k].filter(i => keyOrder.indexOf(i) === -1);
			keyOrder.push(...unique);
		});

		let vi = (json && json.Items) || json;

		for (let n in vi) {
			if (Object.prototype.hasOwnProperty.call(vi, n)) {
				n = vi[n];
				if (n && !isEmpty(n.transcripts)) {
					n.transcripts = n.transcripts
						.map(prefix)
						.map(applyTranscriptMimeType);
				}

				if (n && !isEmpty(n.sources)) {
					n.sources = n.sources.map(applySourceMimeType);
				}
			}
		}

		return new MediaIndex(service, parent, vi, keyOrder, containers);
	}

	static combine(list) {
		return !list || list.length === 0
			? null
			: list.reduce((a, b) => a.combine(b));
	}

	constructor(service, parent, data, order, containers) {
		this[Service] = service;
		this[Parent] = parent;
		this[Order] = order || data[Order] || [];
		this[Data] = {};
		this[Containers] = containers;

		delete data[Order];

		for (let key of Object.keys(data)) {
			try {
				this[Data][key] = this.mediaFrom(data[key], this);
			} catch (e) {
				if (/No Parser/i.test(e.message)) {
					logger.warn(e.message, data[key]);
				} else {
					logger.error(e.stack || e.message || e);
				}
			}
		}

		for (let media of this) {
			if (media.isSlideDeck) {
				let mId = media.getID();
				for (let videoRef of media.Videos || []) {
					const video = this.get(videoRef.videoId);
					if (video && !(video.slidedecks || []).includes(mId)) {
						(video.slidedecks = video.slidedecks || []).push(mId);
					}
				}
			}
		}
	}

	[Symbol.iterator]() {
		const data = this[Data];
		const snapshot = this[Order];
		const { length } = snapshot;

		let index = 0;

		return {
			next() {
				const done = index >= length;
				const value = data[snapshot[index++]];

				return { value, done };
			},
		};
	}

	// This can be removed after the app (@ f029a9165) has been released to all environments.
	// @deprecated Use mediaFrom instead.
	videoFrom(data, parent) {
		return this.mediaFrom(data, parent);
	}

	mediaFrom(data, parent) {
		return getMedia(this[Service], parent, data);
	}

	get length() {
		return this[Order].length;
	}

	combine(that) {
		let order = this[Order].concat(that[Order]);
		let data = { ...this[Data], ...that[Data] };
		let containers = { ...this[Containers], ...that[Containers] };

		return new MediaIndex(
			this[Service],
			this[Parent],
			data,
			order,
			containers
		);
	}

	scoped(containerId) {
		let list = this[Containers][containerId] || [];
		return this.filter(o => list.indexOf(o.getID()) >= 0);
	}

	filter(fn) {
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

		return new MediaIndex(
			this[Service],
			this[Parent],
			data,
			order,
			containers
		);
	}

	map(fn) {
		return this[Order].map((v, i, a) => fn(this[Data][v], i, a));
	}

	reduce(fn, initial) {
		return this[Order].reduce(
			(agg, v, i, a) => fn(agg, this[Data][v], i, a),
			initial
		);
	}

	indexOf(id) {
		return this[Order].indexOf(id);
	}

	get(id) {
		return this[Data][id];
	}

	getAt(index) {
		let id = this[Order][index];
		return id && this.get(id);
	}

	getPageSource() {
		if (!this[PageSource]) {
			this[PageSource] = new PageSourceModel(this);
		}

		return this[PageSource];
	}
}
