import { decorate } from '@nti/lib-commons';
import { mixin } from '@nti/lib-decorators';

import { model, COMMON_PREFIX } from '../Registry';
import Completable from '../../mixins/Completable';
import Base from '../Base';

/*
	description: data.description,
	icon: data.thumbnail,
	title: data.title,
	ConfiguredTool: data.ConfiguredTool,
	NTIID: data.ntiid
*/
class LTIExternalToolAsset extends Base {
	static MimeType = COMMON_PREFIX + 'ltiexternaltoolasset';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		byline: 		{ type: 'string' },
		description: 	{ type: 'string' },
		icon: 			{ type: 'string' },
		title: 			{ type: 'string' },
		ConfiguredTool: { type: 'model'  },
		'launch_url': 	{ type: 'string' },
	};

	constructor(service, parent, data) {
		super(service, parent, data);
	}

	resolveIcon(bundle) {
		const { icon } = this;

		if (icon) {
			return icon;
		}

		const p = bundle.getPackage(this['target-NTIID']);

		return p && p.icon;
	}
}

export default decorate(LTIExternalToolAsset, {
	with: [model, mixin(Completable)],
});
