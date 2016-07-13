export function getLinks (o) {
	return (o && o.Links) ? o.Links : o;
}

export default function getLink (o, rel, raw) {

	o = getLinks(o);

	for (let i = o && o.length - 1; i >= 0; i--) {
		let v = o[i];
		if (v && (v.rel === rel || (typeof rel === 'string' && v.rel.toLowerCase() === rel.toLowerCase()))) {
			return raw === true ? v : v.href;
		}
	}
}
