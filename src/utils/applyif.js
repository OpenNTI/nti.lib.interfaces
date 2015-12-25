export default function (dest, src) {
	for(let i of Object.keys(src)) {

		if (dest[i] == null) {//intentional "== null"
			dest[i] = src[i];
		}

	}

	return dest;
}
