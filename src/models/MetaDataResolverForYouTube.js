import QueryString from 'query-string';

import {getAPIKey} from '../utils/GoogleAPI';

const URL = 'https://www.googleapis.com/youtube/v3/videos?';

const FAIL_POSTER = 'http://img.youtube.com/vi/{0}/hqdefault.jpg';
const FAIL_THUMB = 'http://img.youtube.com/vi/{0}/default.jpg';

function getThumbnail (data, key) {
	const {snippet} = data || {};
	const {thumbnails = {}} = snippet || {};
	const {url} = thumbnails[key] || {};
	return url;
}

export default class MetaDataResolverForVimeo {

	static resolve (service, source) {

		let id = source.source;
		id = Array.isArray(id) ? id[0] : id;

		return getAPIKey(service)
			.catch(e => console.error(e) || Promise.reject('No API'))  //eslint-disable-line no-console

			.then(key => URL.replace('{0}', id) + QueryString.stringify({ key, part: 'snippet,statistics', id }))
			.then(url => service.get(url))

			.then(o=> o.items.find(x => x.id === id) || Promise.reject('Not Found'))

			.then(o=> ({
				poster: getThumbnail(o, 'high') || FAIL_POSTER.replace('{id}', id),
				thumbnail: getThumbnail(o, 'default') || FAIL_THUMB.replace('{id}', id),
				title: (o.snippet || {}).title
			}))
			.catch(failure => console.error(failure) || ({ //eslint-disable-line no-console
				failure,
				poster: FAIL_POSTER.replace('{0}', id),
				thumbnail: FAIL_THUMB.replace('{0}', id)
			}));

		/*
		{
			"kind": "youtube#videoListResponse",
			"etag": "\"fpJ9onbY0Rl_LqYLG6rOCJ9h9N8/CMgINI45f83OPwUWT305gjJ9jEE\"",
			"pageInfo": {
				"totalResults": 1,
				"resultsPerPage": 1
			},
			"items": [
				{
					"kind": "youtube#video",
					"etag": "\"fpJ9onbY0Rl_LqYLG6rOCJ9h9N8/MPcch5Trz9YsmE3KtFBaaW6LoOE\"",
					"id": "gzDS-Kfd5XQ",
					"snippet": {
						"publishedAt": "2008-08-06T18:56:56.000Z",
						"channelId": "UCoookXUzPciGrEZEXmh4Jjg",
						"title": "Sesame Street: Ray Charles Sings \"I Got A Song\"  With Bert & Ernie",
						"description": "For more videos and games check out our new website at http://www.sesamestreet.org \n\nIn this video, Bert and Ernie perform with Ray Charles. \n\nSesame Street is a production of Sesame Workshop, a nonprofit educational organization which also produces Pinky Dinky Doo, The Electric Company, and other programs for children around the world.",
						"thumbnails": {
							"default": {
								"url": "https://i.ytimg.com/vi/gzDS-Kfd5XQ/default.jpg",
								"width": 120,
								"height": 90
							},
							"medium": {
								"url": "https://i.ytimg.com/vi/gzDS-Kfd5XQ/mqdefault.jpg",
								"width": 320,
								"height": 180
							},
							"high": {
								"url": "https://i.ytimg.com/vi/gzDS-Kfd5XQ/hqdefault.jpg",
								"width": 480,
								"height": 360
							}
						},
						"channelTitle": "Sesame Street",
						"tags": [ "sesame", "street", "celebrity", "ray", "charles", "ernie", "bert", "muppet", "instruments", "guitar", "drums", "piano", "Ray Charles", "Bert & Ernie", "Bert and Ernie", "I Got A Song", "Sesame Street", "Sesame Street song", "celeb", "#smb" ],
						"categoryId": "24",
						"liveBroadcastContent": "none",
						"localized": {
							"title": "Sesame Street: Ray Charles Sings \"I Got A Song\"  With Bert & Ernie",
							"description": "For more videos and games check out our new website at http://www.sesamestreet.org \n\nIn this video, Bert and Ernie perform with Ray Charles. \n\nSesame Street is a production of Sesame Workshop, a nonprofit educational organization which also produces Pinky Dinky Doo, The Electric Company, and other programs for children around the world."
						}
					},
					"statistics": {
						"viewCount": "1550045",
						"likeCount": "1202",
						"dislikeCount": "65",
						"favoriteCount": "0",
						"commentCount": "216"
					}
				}
			]
		}
		*/
	}
}
