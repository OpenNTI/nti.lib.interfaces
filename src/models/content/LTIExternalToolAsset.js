// import { mixin } from 'nti-lib-decorators';

// import Completable from '../../mixins/Completable';
import { model, COMMON_PREFIX } from '../Registry';
import Base from '../Base';

// @mixin(Completable)

/*
	description: data.description,
	icon: data.thumbnail,
	title: data.title,
	ConfiguredTool: data.ConfiguredTool,
	NTIID: data.ntiid
*/

export default
@model
class LTIExternalToolAsset extends Base {
	static MimeType = COMMON_PREFIX + 'ltiexternaltoolasset'

	static Fields = {
		...Base.Fields,
		'description': { type: 'string' },
		'icon': { type: 'string' },
		'title': { type: 'string' },
		'ConfiguredTool': { type: 'model' },
	}


	constructor (service, parent, data) {
		super(service, parent, data);
	}


	resolveIcon (bundle) {
		const { icon } = this;

		if (icon) {
			return icon;
		}

		const p = bundle.getPackage(this['target-NTIID']);

		return p && p.icon;
	}
}