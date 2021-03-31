import URL from 'url';
import path from 'path';

import QueryString from 'query-string';
import { parse, toSeconds } from 'iso8601-duration';

import { getAPIKey } from '../../utils/GoogleAPI.js';

const API = 'https://www.googleapis.com/youtube/v3/videos?';
const FAIL_POSTER = 'http://img.youtube.com/vi/{0}/hqdefault.jpg';
const FAIL_THUMB = 'http://img.youtube.com/vi/{0}/default.jpg';

function getThumbnail(data, key) {
	const { snippet } = data || {};
	const { thumbnails = {} } = snippet || {};
	const { url } = thumbnails[key] || {};
	return url;
}

async function buildURL(service, source) {
	let id = source.source;
	id = Array.isArray(id) ? id[0] : id;

	if (!service.isServerSide) {
		const { server, basepath } = service.getConfig();
		return (
			URL.resolve(server, path.resolve(basepath, 'api/videos/youtube')) +
			'?' +
			QueryString.stringify({
				part: 'contentDetails,snippet,statistics',
				id,
			})
		);
	}

	try {
		// See here for details: https://developers.google.com/youtube/v3/docs/videos
		const key = await getAPIKey(service);
		return API.replace('{0}', id) + QueryString.stringify({ key });
	} catch (e) {
		//eslint-disable-next-line no-console
		console.error(e);
	}

	return Promise.reject('No API');
}

const CACHE = {};
function get(url) {
	if (!CACHE[url]) {
		CACHE[url] = fetch(url).then(r =>
			r.ok ? r.json() : Promise.reject(r)
		);
	}
	return CACHE[url];
}

export default class MetaDataResolverForYouTube {
	//Utility method for service side...
	static /*async*/ resolveURL(service, videoId) {
		return buildURL(service, { source: videoId });
	}

	static resolve(service, source) {
		let id = source.source;
		id = Array.isArray(id) ? id[0] : id;

		return buildURL(service, source)
			.then(get)

			.then(
				o =>
					o.items.find(x => x.id === id) ||
					Promise.reject('Not Found')
			)

			.then(o => ({
				poster:
					getThumbnail(o, 'high') || FAIL_POSTER.replace('{id}', id),
				thumbnail:
					getThumbnail(o, 'default') ||
					FAIL_THUMB.replace('{id}', id),
				title: (o.snippet || {}).title,
				description: (o.snippet || {}).description,
				duration: toSeconds(
					parse((o.contentDetails || {}).duration || '')
				),
			}))
			.catch(
				failure =>
					//eslint-disable-next-line no-console
					console.error(
						'Failed to load YouTube info: %s\n%o',
						id,
						failure
					) || {
						failure,
						poster: FAIL_POSTER.replace('{0}', id),
						thumbnail: FAIL_THUMB.replace('{0}', id),
					}
			);
	}

	static resolveCanAccess(service, source) {
		return buildURL(service, source)
			.then(get)
			.then(
				() => true,
				() => false
			);
	}
}
