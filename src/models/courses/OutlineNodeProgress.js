import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

export default class OutlineNodeProgress extends Base {
	static MimeType = [
		COMMON_PREFIX + 'courseoutlinenodeprogress',
		COMMON_PREFIX + 'progresscontainer',
	];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Items': { type: 'model{}' },
	};

	getProgress(ntiid) {
		return this.Items[ntiid];
	}
}

Registry.register(OutlineNodeProgress);
