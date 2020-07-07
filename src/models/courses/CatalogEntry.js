import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

import CatalogEntryFactory from './CatalogEntryFactory';


const EnrollmentOptions = Symbol('EnrollmentOptions');


class CourseCatalogEntry extends Base {
	static MimeType = COMMON_PREFIX + 'courses.catalogentry'

	static Fields = {
		...Base.Fields,
		'DCCreator':                            { type: 'string[]', name: 'creators'        },
		'ContentPackages':                      { type: 'string[]'                          },
		'ContentPackageNTIID':                  { type: 'string'                            },
		'CourseNTIID':                          { type: 'string'                            },
		'CatalogFamilies':                      { type: 'model'                             },
		'EndDate':                              { type: 'date'                              },
		'EnrollmentOptions':                    { type: 'model',    name: EnrollmentOptions },
		'ProviderUniqueID':                     { type: 'string'                            },
		'Title':                                { type: 'string'                            },
		'Preview':                              { type: 'boolean'                           },
		'IsAdmin':                              { type: 'boolean'                           },
		'StartDate':                            { type: 'date'                              },
		'Instructors':                          { type: 'model[]'                           },
		'Video':                                { type: 'string'                            },
		'PlatformPresentationResources':        { type: 'object'                            },
		'Duration':                             { type: 'string'                            },
		'RichDescription':                      { type: 'string'                            },
		'Description':                          { type: 'string'                            },
		'ProviderDepartmentTitle':              { type: 'string'                            },
		'Schedule':                             { type: 'object'                            },
		'Credit':                               { type: 'object[]'                          },
		'Prerequisites':                        { type: 'object[]'                          },
		'title':                                { type: 'string'                            },
		'RealEnrolmentStatus':                  { type: 'string'                            },
		'description':                          { type: 'string'                            },
		'tags':                                 { type: 'string[]'                          },
		'IsEnrolled':                           { type: 'boolean'                           },
		'is_non_public':                        { type: 'boolean',  name: 'isHidden'        },
		'TotalEnrolledCount':                   { type: 'number'                            },
		'awardable_credits':                    { type: 'model[]', name: 'credits'          },
		'AwardsCertificate':                    { type: 'boolean'                           }
	}

	static getFactory (service) {
		return CatalogEntryFactory.from(service);
	}

	isCourse = true
	isCourseCatalogEntry = true

	constructor (service, data) {
		super(service, null, data);

		if (!this.ContentPackages) {
			this.ContentPackages = [this.ContentPackageNTIID];
		}
	}


	get isPublic () { return !this.IsHidden; }


	get author () { return (this.creators || []).join(', '); }


	getPresentationProperties () {
		return {
			author: this.getAuthorLine(),
			title: this.Title,
			label: this.ProviderUniqueID
		};
	}


	getEnrollmentOptions () {return this[EnrollmentOptions]; }


	getAuthorLine () {
		let taRe = (/Teaching Assistant/i),
			instructors = this.Instructors;

		let nonAssistants = (instructors || [])
			.filter(n=>!taRe.test(n.JobTitle));

		let assistants = (instructors || [])
			.filter(n=>taRe.test(n.JobTitle));

		return nonAssistants.concat(assistants).map(n=>n.Name).join(', ');
	}


	getCatalogFamily () {
		const {CatalogFamilies} = this;

		return CatalogFamilies && CatalogFamilies.getPrimaryFamily();
	}


	isInFamily (id) {
		return this.CatalogFamilies && this.CatalogFamilies.containsFamily(id);
	}


	inSameFamily (catalogEntry) {
		const {CatalogFamilies} = this;

		if (!CatalogFamilies) { return false; }

		return CatalogFamilies.hasIntersectionWith(catalogEntry.CatalogFamilies);
	}
}

export default decorate(CourseCatalogEntry, {with:[model]});
