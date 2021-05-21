/**
 * @typedef {{
 * 	rel: string;
 * 	href: string;
 * 	ntiid?: string;
 * 	result?: string;
 * }} Link
 */

/** @typedef {{ Links: Link[]; }} HasLinks */

/**
 * @template {HasLinks | Link[]} T
 * @param {T} o
 * @returns {Link[] | typeof o}
 */
export function getLinks(o) {
	return o?.Links || o;
}

export default function getLink(o, rel, rawOrProp) {
	o = getLinks(o);

	for (let i = o?.length - 1; i >= 0; i--) {
		let v = o[i];
		if (
			v &&
			(v.rel === rel ||
				(typeof rel === 'string' &&
					v.rel.toLowerCase() === rel.toLowerCase()))
		) {
			return rawOrProp === true
				? v
				: typeof rawOrProp === 'string'
				? v[rawOrProp]
				: v.href;
		}
	}
}
