import url from 'url';

import QueryString from 'query-string';

import {Service, Context} from '../../../constants';

const NOT_FOUND = 'ENTRY_ID_NOT_FOUND';

const isHLS = RegExp.prototype.test.bind(/ip(hone|ad)new/i);
const isAppleMBR = RegExp.prototype.test.bind(/applembr/i);
const isOGG = RegExp.prototype.test.bind(/^og[gv]$/i);
const isWebM = RegExp.prototype.test.bind(/webm|matroska/i);
const isMP4 = RegExp.prototype.test.bind(/mp4/i);
const is3gp = RegExp.prototype.test.bind(/3gp/i);

const kalturaRe = /kaltura/i;

export default class KalturaProvider {

	static service = 'kaltura';

	static handles (uri) {
		const u = url.parse(uri);
		return kalturaRe.test(u.protocol) || kalturaRe.test(u.host);
	}


	static getID (href) {
		const parts = getIDParts(href);
		return parts && Array.isArray(parts) && `${parts.join(':')}`;
	}


	static getCanonicalURL (href, videoId) {
		const id = videoId || getURLID(getIDParts(href));
		return `kaltura://${id}`;
	}


	constructor (service) {
		this[Service] = service;
	}


	getURL (source) {
		return buildURL(this[Service], source);
	}


	resolveEntity (source) {
		return fetch(this.getURL(source))
			.then(x => x.json())
			.then(result => parseResult(result));
	}
}


//Private util functions


function normalizeUrl (href) {
	const forceTrailingSlash = x => String(x).substr(-1) === '/' ? x : `${x}/`;

	if (/^kaltura/i.test(href)) {
		return forceTrailingSlash(href);
	}

	const parseEmbedSrc = src => {
		const srcRegex = /^.*\/partner_id\/(\w*).*entry_id=(\w*).*$/gi;
		const [, partnerId, entryId] = src.split(srcRegex);

		if (partnerId && entryId) {
			return `kaltura://${partnerId}/${entryId}/`;
		}

		return src;
	};

	if (href.includes('/p/') && href.includes('/sp/')) {
		return parseEmbedSrc(href);
	}

	const parts = url.parse(href, true);

	if (href.includes('/id/')) {
		const partnerId = parts.query.playerId;
		const pathname = parts.pathname.split('/id/');
		const entryId = pathname[pathname.length - 1];
		return `kaltura://${partnerId}/${entryId}/`;
	}

	if (href.includes('index.php')) {
		const regex = /\/partner_id\/(\d*)\/.*\/entry_id\/(\w*)/gi;

		const [, partnerId, entryId] = parts.path.split(regex);
		if (partnerId && entryId) {
			return `kaltura://${partnerId}/${entryId}/`;
		}
	}

	return href;
}


/**
 * ID should take the form `${partnerId}/${entryId}` for consistency
 * with Vimeo and YouTube (and the Video component), but in rst the
 * server expects `${partnerId}:${entryId}`.
 * @param  {string} href kaltura video href
 * @return {string} id of the form `${partnerId}/${entryId}`
 */
function getIDParts (href) {
	if (Array.isArray(href)) {
		return href;
	}

	const [service, rest] = normalizeUrl(href).split('://');
	if (!(/^kaltura/i.test(service) && rest)) {
		return;
	}

	const [providerId, videoId] = rest.split('/');
	if (!(providerId && videoId)) {
		return;
	}

	return [providerId, videoId];
}


function getURLID (href) {
	const parts = [...getIDParts(href)];
	const hrefId = parts && Array.isArray(parts) && parts.join('/');
	return `${hrefId}/`; //trailing / is required...
}


function kalturaSig (str) {
	let hash = 0;
	if (str.length === 0) { return hash; }
	for (let i = 0; i < str.length; i++) {
		let currentChar = str.charCodeAt(i);
		/* eslint-disable no-bitwise */
		hash = ((hash << 5) - hash) + currentChar;
		hash = hash & hash;
		/* eslint-enable no-bitwise */
	}
	return hash;
}


/*
 * Stand alone source grabber.
 * grabbed from http://player.kaltura.com/kWidget/kWidget.getSources.js
 */
function getParams (partnerId, entryId, context = {}) {
	const referrer = global.document ? global.document.URL : (context.url || '');
	const param = {
		service: 'multirequest',
		apiVersion: '3.1',
		expiry: '86400',
		clientTag: 'kwidget:v2.18',
		format: 9,
		ignoreNull: 1,
		action: 'null',

		'1:service': 'session',
		'1:action': 'startWidgetSession',
		'1:widgetId': '_' + partnerId,

		'2:ks': '{1:result:ks}',
		'2:contextDataParams:referrer': referrer,
		'2:contextDataParams:objectType': 'KalturaEntryContextDataParams',
		'2:contextDataParams:flavorTags': 'all',
		'2:service': 'baseentry',
		'2:entryId': entryId,
		'2:action': 'getContextData',

		'3:ks': '{1:result:ks}',
		'3:service': 'baseentry',
		'3:action': 'get',
		'3:version': '-1',
		'3:entryId': entryId
	};

	//Do not alter these three lines
	param.kalsig = kalturaSig(QueryString.stringify(param));
	param.format = 1;
	delete param.service;

	return param;
}


function parseResult (result) {
	const {location} = global;
	const protocol = location ? location.protocol.replace(':', '') : 'https';


	const serviceUrl = (protocol === 'https') ?
		'://www.kaltura.com' :
		'://cdnbakmi.kaltura.com';

	const [, data, entryInfo] = result;

	if (data.code === NOT_FOUND) {
		return Promise.reject();
	}

	const assets = data.flavorAssets || [];

	const baseUrl = protocol + serviceUrl + '/p/' + entryInfo.partnerId +
			'/sp/' + entryInfo.partnerId + '00/playManifest';

	const adaptiveFlavors = assets.map(a => isHLS(a.tags) && a.id).filter(x => x);

	const deviceSources = assets
		.filter(asset=> asset.status === 2 && asset.width)
		.map(asset => {
			const source = {
				bitrate: asset.bitrate * 8,
				width: asset.width,
				height: asset.height,
				tags: asset.tags
			};

			let src = baseUrl + '/entryId/' + asset.entryId;

			// Check if Apple http streaming is enabled and the tags include applembr ( single stream HLS )
			if ( isAppleMBR(asset.tags)) {
				return {
					type: 'application/vnd.apple.mpegurl',
					src: `${src}/format/applehttp/protocol/${protocol}/a.m3u8`
				};
			}

			src += '/flavorId/' + asset.id + '/format/url/protocol/' + protocol;

			if ( isMP4(asset.fileExt) || asset.containerFormat === 'isom') {
				source.src = src + '/a.mp4';
				source.type = 'video/mp4';
			}

			if ( isOGG(asset.fileExt) || isOGG(asset.containerFormat)) {
				source.src = src + '/a.ogg';
				source.type = 'video/ogg';
			}

			if ( isWebM(asset.fileExt) || isWebM(asset.tags) || isWebM(asset.containerFormat)) {
				source.src = src + '/a.webm';
				source.type = 'video/webm';
			}

			if (is3gp(asset.fileExt)) {
				source.src = src + '/a.3gp';
				source.type = 'video/3gp';
			}

			return source;
		})
		.filter(s => s.src);

	// Add the flavor list adaptive style urls ( multiple flavor HLS ):
	if ( adaptiveFlavors.length !== 0 ) {
		deviceSources.push({
			'data-flavorid': 'HLS',
			type: 'application/vnd.apple.mpegurl',
			src: `${baseUrl}/entryId/${entryInfo.id}/flavorIds/${adaptiveFlavors.join(',')}/format/applehttp/protocol/${protocol}/a.m3u8`
		});
	}


	const w = 1280;
	const poster =	'//www.kaltura.com/p/' + entryInfo.partnerId +
					'/thumbnail/entry_id/' + entryInfo.id +
					'/width/' + w + '/';

	return {
		objectType: data.objectType,
		code: data.code,
		poster: poster,
		duration: entryInfo.duration,
		name: entryInfo.name,
		title: entryInfo.title,
		entryId: entryInfo.id,
		description: entryInfo.description,
		sources: deviceSources
	};
}


function buildURL (service, source) {
	let id = source.source;
	id = Array.isArray(id) ? id[0] : id;

	const [partnerId, entryId] = id.split(':');
	const params = QueryString.stringify(getParams(partnerId, entryId, service[Context]));

	return `https://cdnapisec.kaltura.com/api_v3/index.php?service=multirequest&${params}`;
}
