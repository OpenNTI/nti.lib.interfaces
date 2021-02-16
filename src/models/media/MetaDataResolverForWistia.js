export const getMetaDataEntryPoint = x =>
	`https://fast.wistia.net/oembed?url=${encodeURIComponent(x)}&width=960`;

const placeholder = encodeURIComponent('{0}');
const URL = getMetaDataEntryPoint('https://support.wistia.com/medias/{0}');

const FAIL = 'data:,';

const getIdFromSource = ({ source: id }) => (Array.isArray(id) ? id[0] : id);

function buildURL(service, source) {
	return URL.replace(placeholder, getIdFromSource(source));
}

export default class MetaDataResolverForWistia {
	static resolve(service, source) {
		const url = buildURL(service, source);

		return fetch(url)
			.then(r => (r.ok ? r.json() : Promise.reject(r)))
			.then(o => ({
				poster: o.thumbnail_url,
				thumbnail: o.thumbnail_url,
				title: o.title,
				duration: o.duration,
			}))
			.catch(error => ({
				failure: error,
				poster: FAIL,
				thumbnail: FAIL,
			}));
	}
}
