export default function ensureArray (a) {
	return Array.isArray(a) ? a :
		(a == null ? [] : [a]);
}
