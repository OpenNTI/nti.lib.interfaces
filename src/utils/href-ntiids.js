import { Base64 } from 'js-base64';

import { parseNTIID } from '@nti/lib-ntiids';

//NOTE: this utility exists in lib-ntiids and needs to be imported from there

const COMMON_PREFIX = 'tag:nextthought.com,2011-10:';

export const SPECIFIC_TYPE = '__nti_object_href';

export function encodeIdFrom(href) {
	const id = encodeURIComponent(Base64.encode(href));
	return `${COMMON_PREFIX}${SPECIFIC_TYPE}-${id}`;
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
	return Base64.decode(decodeURIComponent(typeSpecific));
}
