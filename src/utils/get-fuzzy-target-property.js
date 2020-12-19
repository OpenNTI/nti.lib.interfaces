/**
 * Finds the NTIID field on the given object.
 *
 * @method getFuzzyID
 * @param  {object}         object                               The object to find an ID for.
 * @param  {Array<string>}  [keys=['Target-NTIID', 'NTIID']]     The possible ID fields.
 * @return {string}         The key name, or undefined.
 */
export default function getFuzzyTargetID (object, keys = ['Target-NTIID', 'NTIID']) {
	const objectKeys = Object.keys(object);

	//We sadly have used inconsistent casing of the Target-NTIID, and NTIID.
	//Some are lowercase, some are capped, some are mixed.
	return keys
		.map(key => {
			key = key.toLowerCase();

			for (let objectKey of objectKeys) {
				if (objectKey.toLowerCase() === key) {
					return objectKey;
				}
			}

			return null;
		})
		.filter(key => !!key)[0];
}
