import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

export default class Solution extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.solution';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'value':                    { type: '*' }	// solution values can be various types
	};
}

Registry.register(Solution);
