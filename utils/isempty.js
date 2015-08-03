
export default function isEmpty (value, allowEmptyString) {
	return	(value === null) ||
			(value === undefined) ||
			(!allowEmptyString && value === '') ||
			(Array.isArray(value) && value.length === 0);
}
