import { parseNTIID } from '@nti/lib-ntiids';

//NOTE: this utility exists in lib-ntiids and needs to be imported from there

const COMMON_PREFIX = 'tag:nextthought.com,2011-10:';
const { atob, btoa } = global;

export const SPECIFIC_TYPE = '__nti_object_href';

export function encodeIdFrom(href) {
	try {
		const id = encodeURIComponent(btoa(href));
		return `${COMMON_PREFIX}${SPECIFIC_TYPE}-${id}`;
	} catch (e) {
		console.error('Missing polyfill for btoa'); //eslint-disable-line no-console
		throw e;
	}
}

export function isHrefId(id) {
	const parsed = parseNTIID(id);
	return parsed && parsed.specific.type === SPECIFIC_TYPE;
}

export function decodeHrefFrom(id) {
	const { specific: data } = parseNTIID(id) || {};
	if (!data) {
		return null;
	}

	const { typeSpecific } = data;
	try {
		return atob(decodeURIComponent(typeSpecific));
	} catch (e) {
		console.error('Missing polyfill for atob'); //eslint-disable-line no-console
		throw e;
	}
}
