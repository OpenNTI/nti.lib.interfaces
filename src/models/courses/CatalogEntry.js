import {mixin} from 'nti-lib-decorators';

import assets from '../../mixins/PresentationResources';
import setAndEmit from '../../utils/getsethandler';
//
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

import CatalogEntryFactory from './CatalogEntryFactory';


const EnrollmentOptions = Symbol('EnrollmentOptions');


export default
@model
@mixin(assets)
class CourseCatalogEntry extends Base {
	static MimeType = [
		COMMON_PREFIX + 'courses.catalogentry',
		COMMON_PREFIX + 'courses.coursecataloglegacyentry', //Really?! Two packages?! :P
		COMMON_PREFIX + 'courseware.coursecataloglegacyentry',
	]

	static Fields = {
		...Base.Fields,
		'DCCreator':           { type: 'string[]', name: 'creators'        },
		'ContentPackages':     { type: 'string[]'                          },
		'ContentPackageNTIID': { type: 'string'                            },
		'EndDate':             { type: 'date'                              },
		'EnrollmentOptions':   { type: 'model',    name: EnrollmentOptions },
		'StartDate':           { type: 'date'                              },
		'Instructors':         { type: 'model[]'                           },
		'Video':               { type: 'string'                            },
	}

	static getFactory (service) {
		return CatalogEntryFactory.from(service);
	}

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
	}


	get author () { return (this.creators || []).join(', '); }


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
