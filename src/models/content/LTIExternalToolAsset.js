import Registry, { COMMON_PREFIX } from '../Registry.js';
import Completable from '../../mixins/Completable.js';
import Base from '../Model.js';

/*
	description: data.description,
	icon: data.thumbnail,
	title: data.title,
	ConfiguredTool: data.ConfiguredTool,
	NTIID: data.ntiid
*/
export default class LTIExternalToolAsset extends Completable(Base) {
	static MimeType = COMMON_PREFIX + 'ltiexternaltoolasset';

	// prettier-ignore
	static Fields = {
		...super.Fields,
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

Registry.register(LTIExternalToolAsset);
