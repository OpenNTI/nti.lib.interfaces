import QueryString from 'query-string';
import {parse, toSeconds} from 'iso8601-duration';

import {getAPIKey} from '../../utils/GoogleAPI';

const URL = 'https://www.googleapis.com/youtube/v3/videos?';

const FAIL_POSTER = 'http://img.youtube.com/vi/{0}/hqdefault.jpg';
const FAIL_THUMB = 'http://img.youtube.com/vi/{0}/default.jpg';

function getThumbnail (data, key) {
	const {snippet} = data || {};
	const {thumbnails = {}} = snippet || {};
	const {url} = thumbnails[key] || {};
	return url;
}

function buildURL (service, source) {
	let id = source.source;
	id = Array.isArray(id) ? id[0] : id;

	return getAPIKey(service)
		// See here for details: https://developers.google.com/youtube/v3/docs/videos
		.catch(e => console.error(e) || Promise.reject('No API')) //eslint-disable-line no-console
		.then(key => URL.replace('{0}', id) + QueryString.stringify({ key, part: 'contentDetails,snippet,statistics', id }));
}

const CACHE = {};
function get (url) {
	if (!CACHE[url]) {
		CACHE[url] = fetch(url)
			.then(r => r.ok ? r.json() : Promise.reject(r));
	}
	return CACHE[url];
}

export default class MetaDataResolverForYouTube {

	static resolve (service, source) {
		let id = source.source;
		id = Array.isArray(id) ? id[0] : id;

		return buildURL(service, source)
			.then(get)

			.then(o=> o.items.find(x => x.id === id) || Promise.reject('Not Found'))

			.then(o=> ({
				poster: getThumbnail(o, 'high') || FAIL_POSTER.replace('{id}', id),
				thumbnail: getThumbnail(o, 'default') || FAIL_THUMB.replace('{id}', id),
				title: (o.snippet || {}).title,
				description: (o.snippet || {}).description,
				duration: toSeconds(parse((o.contentDetails || {}).duration || ''))
			}))
			.catch(failure => console.error(failure) || ({ //eslint-disable-line no-console
				failure,
				poster: FAIL_POSTER.replace('{0}', id),
				thumbnail: FAIL_THUMB.replace('{0}', id)
			}));
	}


	static resolveCanAccess (service, source) {
		return buildURL(service, source)
			.then(get)
			.then(() => true, () => false);
	}
}
