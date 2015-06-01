import {
	Service,
	Pending
} from '../CommonSymbols';

import Url from 'url';
import {EventEmitter} from 'events';

import {parse} from '../models';

import ensureInstanceCountDoesNotReach from '../utils/debugging-invoke-limiter';

import {ROOT_NTIID, REL_MESSAGE_INBOX} from '../constants';
import getLink from '../utils/getlink';
import forwardFunctions from '../utils/function-forwarding';
import QueryString from 'query-string';

import waitFor from '../utils/waitfor';

let BATCH_SIZE = 5;

let inflight;

const ApplyData = Symbol('Apply Data');

function cleanInflight() { inflight = null; }


export default class Notifications extends EventEmitter {

	static load (service, reload) {

		if (inflight) {
			return inflight;
		}

		//We need some links...
		inflight = service.getPageInfo(ROOT_NTIID)
		//Find our url to fetch notifications from...
			.then(pageInfo => {
				let url = pageInfo.getLink(REL_MESSAGE_INBOX);
				if (!url) {
					return Promise.reject('No Notifications url');
				}

				url = Url.parse(url);

				url.search = QueryString.stringify({
					batchSize: BATCH_SIZE,
					batchStart: 0
				});

				return url.format();
			})

		//Load the notifications...
		.then(url => get(service, url, reload))
		.catch(reason => {
			console.warn(reason);
			return {};
		})

		//Now we can build the Notifications store object.
		.then(data => {
			return new Notifications(service, data);
		});

		inflight.then(cleanInflight, cleanInflight);

		return inflight;
	}


	constructor (service, data) {
		super();
		ensureInstanceCountDoesNotReach(this, 2);

		this[Service] = service;
		this.Items = [];

		Object.assign(this, forwardFunctions(['every', 'filter', 'forEach', 'map', 'reduce'], 'Items'));


		this[ApplyData](data);

		this.lastViewed = new Date(parseFloat(data.lastViewed || 0) * 1000);
	}

	get isBusy () { return !!inflight; }

	get hasMore () { return !!this.nextBatchSrc; }

	get length () { return (this.Items || []).length; }



	nextBatch () {
		let clean = cleanInflight;

		if (!inflight) {
			if (this.nextBatchSrc) {
				inflight = get(this[Service], this.nextBatchSrc, true)
					.then(this[ApplyData].bind(this));

				inflight.then(clean, clean);

			} else {
				return Promise.fulfill(this);
			}
		}

		return inflight;
	}


	[ApplyData] (data) {
		this.Items = this.Items.concat(data.Items);
		this.nextBatchSrc = (data.TotalItemCount > this.Items.length) &&
			getLink(data, 'batch-next');

		return this;
	}
}


function get(s, url, ignoreCache) {
	let cache = s.getDataCache();

	let cached = cache.get(url), result;
	if (!cached || ignoreCache) {
		result = s.get(url)
		.then(data => cache.set(url, data) && data)
		.catch(()=>({titles: [], Items: []}));
	} else {
		result = Promise.resolve(cached);
	}

	return result.then(resolveUIData.bind(null, s));
}


function resolveUIData(service, data) {
	let pending = [];

	data.Items = data.Items.map(o => {
		try {
			o = parse(service, null, o);
			if (o && o[Pending]) {
				pending.push(...o[Pending]);
			}
		} catch(e) {
			console.warn(e.NoParser ? e.message : (e.stack || e.message || e));
		}
		return o;
	});

	return waitFor(pending).then(()=> data);
}
