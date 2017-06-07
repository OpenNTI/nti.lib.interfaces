import {mixin} from 'nti-lib-decorators';

import { Parser as parse, DateFields } from '../../constants';
import assets from '../../mixins/PresentationResources';
import setAndEmit from '../../utils/getsethandler';
//
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

const EnrollmentOptions = Symbol('EnrollmentOptions');

const rename = Symbol.for('TakeOver');

@model
@mixin(assets)
export default class CourseCatalogEntry extends Base {
	static MimeType = [
		COMMON_PREFIX + 'courses.catalogentry',
		COMMON_PREFIX + 'courses.coursecataloglegacyentry', //Really?! Two packages?! :P
		COMMON_PREFIX + 'courseware.coursecataloglegacyentry',
	]

	isCourse = true

	constructor (service, data) {
		super(service, null, data);

		if (!this.ContentPackages) {
			this.ContentPackages = [this.ContentPackageNTIID];
		}

		this.addToPending(
			this.getAsset('landing').then(setAndEmit(this, 'icon')),
			this.getAsset('thumb').then(setAndEmit(this, 'thumb')),
			this.getAsset('background').then(setAndEmit(this, 'background'))
		);

		if (!this.Video) {
			this.addToPending(
				this.getAsset('promo', true).then(setAndEmit(this, 'promoImage'))
			);
		}

		this[parse]('EnrollmentOptions');

		this[rename]('EnrollmentOptions', EnrollmentOptions);
	}

	[DateFields] () {
		return super[DateFields]().concat([
			'EndDate',
			'StartDate'
		]);
	}


	get author () { return (this.DCCreator || []).join(', '); }


	getEnrollmentOptions () {return this[EnrollmentOptions]; }


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
