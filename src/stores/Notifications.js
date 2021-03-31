import EventEmitter from 'events';

import Logger from '@nti/util-logger';
import { forward, wait, URL } from '@nti/lib-commons';

import { Service, ROOT_NTIID, REL_MESSAGE_INBOX } from '../constants.js';
import { parse } from '../models/Parser.js';
import getLink from '../utils/get-link.js';

let inflight;

const logger = Logger.get('store:notifications');

const BATCH_SIZE = 5;
const cleanInflight = () => (inflight = null);

export default class Notifications extends EventEmitter {
	static load(service, reload) {
		if (inflight) {
			return inflight;
		}

		//We need some links...
		inflight = service
			.getPageInfo(ROOT_NTIID)
			//Find our url to fetch notifications from...
			.then(pageInfo => {
				const url = pageInfo.getLink(REL_MESSAGE_INBOX);
				if (!url) {
					return Promise.reject('No Notifications url');
				}

				return URL.appendQueryParams(url, {
					batchSize: BATCH_SIZE,
					batchStart: 0,
				});
			})

			//Load the notifications...
			.then(url => get(service, url, reload))
			.catch(reason => {
				logger.warn(reason);
				return {};
			})

			//Now we can build the Notifications store object.
			.then(data => new Notifications(service, data));

		inflight.catch(() => {}).then(cleanInflight);

		return inflight;
	}

	constructor(service, data) {
		super();

		this[Service] = service;
		this.Items = [];

		Object.assign(
			this,
			forward(['every', 'filter', 'forEach', 'map', 'reduce'], 'Items')
		);

		applyData(this, data);

		this.lastViewed = new Date(parseFloat(data.lastViewed || 0) * 1000);
	}

	get isBusy() {
		return !!inflight;
	}

	get hasMore() {
		return !!this.nextBatchSrc;
	}

	get length() {
		return (this.Items || []).length;
	}

	nextBatch() {
		let clean = cleanInflight;

		if (!inflight) {
			if (this.nextBatchSrc) {
				inflight = get(
					this[Service],
					this.nextBatchSrc,
					true
				).then(data => applyData(this, data));

				inflight.then(clean, clean);
			} else {
				return Promise.fulfill(this);
			}
		}

		return inflight;
	}
}

function applyData(scope, data) {
	scope.Items = scope.Items.concat(data.Items || []);
	scope.nextBatchSrc =
		data.TotalItemCount > scope.Items.length && getLink(data, 'batch-next');

	return scope;
}

function get(service, url, ignoreCache) {
	let cache = service.getDataCache();

	let cached = cache.get(url),
		result;
	if (!cached || ignoreCache) {
		result = service
			.get(url)
			.then(data => cache.set(url, data) && data)
			.catch(() => ({ titles: [], Items: [] }));
	} else {
		result = Promise.resolve(cached);
	}

	return result.then(data => resolveUIData(service, data));
}

function resolveUIData(service, data) {
	let pending = [];

	data.Items = data.Items.map(o => {
		try {
			o = parse(service, null, o);
			if (o?.waitForPending) {
				pending.push(o.waitForPending());
			}
		} catch (e) {
			logger.warn(e.NoParser ? e.message : e.stack || e.message || e);
		}
		return o;
	});

	return wait.on(pending).then(() => data);
}
