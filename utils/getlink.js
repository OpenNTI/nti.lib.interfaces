export default function getLink(o, rel, raw) {

	if (o && o.Links) { o = o.Links; }

	for (let i = o && o.length - 1; i>=0; i--) {
		let v = o[i];
		if (v && v.rel === rel) {
			return raw === true ? v : v.href;
		}
	}
}

/**
 * This function is an anti-pattern. TODO: consolidate all link getting/referencing to the getLink version (perferibly
 * as a method call off of a model, instead of a function call on a raw jso)
 */
export function asMap(o) {

	//console.error('Prefer getLink(data, linkName)...');

	if (o && o.Links) { o = o.Links; }
	if (!Array.isArray(o)) {
		o = [o];
	}

	let m = {};
	for (let i = o.length - 1; i>=0; i--) {
		let v = o[i];
		if (m[v.rel]) {console.warn('There are more than one instances of %s', v.rel);}
		m[v.rel] = v.href;
	}

	return m;
}
