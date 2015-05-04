import Base from '../Base';
import {
	Parser as parse,
	DateFields
} from '../../CommonSymbols';

import setAndEmit from '../../utils/getsethandler';

import assets from '../mixins/PresentationResources';

export default class CourseCatalogEntry extends Base {
	constructor (service, data) {
		super(service, null, data, {isCourse: true}, assets);

		if (!this.ContentPackages) {
			this.ContentPackages = [this.ContentPackageNTIID];
		}

		this.addToPending(
			this.getAsset('landing').then(setAndEmit(this, 'icon')),
			this.getAsset('thumb').then(setAndEmit(this, 'thumb')),
			this.getAsset('background').then(setAndEmit(this, 'background'))
		);

		this[parse]('EnrollmentOptions');
	}

	[DateFields] () {
		return super[DateFields]().concat([
			'EndDate',
			'StartDate'
		]);
	}


	get author () { return (this.DCCreator || []).join(', '); }


	getDefaultAssetRoot () { return ''; }


	getAuthorLine () {
		let taRe = (/Teaching Assistant/i),
			instructors = this.Instructors;

		return (instructors && instructors
								.filter(n=>!taRe.test(n.JobTitle))
								.map(n=>n.Name).join(', ')
				) || '';
	}
}
