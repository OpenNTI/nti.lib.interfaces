const { location } = global;
const domain = !location
	? ''
	: `&domain=${encodeURIComponent(location.hostname)}`;
const size = '&width=960';
export const getMetaDataEntryPoint = x =>
	`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(
		x
	)}${domain}${size}`;

const placeholder = encodeURIComponent('{0}');
const URL = getMetaDataEntryPoint('https://vimeo.com/{0}');

const FAIL = 'data:,';

const getIDFromSource = ({ source: id }) => (Array.isArray(id) ? id[0] : id);

function buildURL(service, source) {
	return URL.replace(placeholder, getIDFromSource(source));
}

export default class MetaDataResolverForVimeo {
	static resolve(service, source) {
		const url = buildURL(service, source);
		// console.log(url);
		return fetch(url)
			.then(r => (r.ok ? r.json() : Promise.reject(r)))
			.then(x => {
				// Check api response for 403 on oembed
				if (x.domain_status_code === 403) {
					return Promise.reject(
						new Error(
							`Vimeo Video: “${getIDFromSource(
								source
							)}” is not embeddable.`
						)
					);
				}

				return x;
			})
			.then(o => o[0] || o)
			.then(o => ({
				poster: o.thumbnail_url,
				thumbnail: o.thumbnail_url,
				title: o.title,
				description: o.description,
				duration: o.duration,
			}))
			.catch(failure => ({
				failure,
				poster: FAIL,
				thumbnail: FAIL,
			}));

		/*
		author_name: "Oklahoma State University"
		author_url: "http://vimeo.com/osu"
		description: ""
		duration: 788
		height: 480
		html: "<iframe..."
		is_plus: "0"
		provider_name: "Vimeo"
		provider_url: "https://vimeo.com/"
		thumbnail_height: 427
		thumbnail_url: "http://i.vimeocdn.com/video/500719224_640.jpg"
		thumbnail_width: 640
		title: "Academic Integrity"
		type: "video"
		uri: "/videos/114672468"
		version: "1.0"
		video_id: 114672468
		width: 720
		 */
	}

	static resolveCanAccess(service, source) {
		const url = buildURL(service, source);

		return fetch(url)
			.then(r => (r.ok ? r.json() : false))
			.then(x => (x.domain_status_code === 403 ? false : true));
	}
}
