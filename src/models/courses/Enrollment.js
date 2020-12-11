import {decorate,forward} from '@nti/lib-commons';
import {mixin} from '@nti/lib-decorators';

import {
	SCOPED_COURSE_INSTANCE,
	Service,
} from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

import CourseIdentity from './mixins/CourseIdentity';
import EnrollmentIdentity from './mixins/EnrollmentIdentity';

const emptyFunction = () => {};
const EMPTY_CATALOG_ENTRY = {getAuthorLine: emptyFunction};
const ACKNOWLEDGE = 'AcknowledgeCompletion';

class Enrollment extends Base {
	static MimeType = [
		COMMON_PREFIX + 'courses.courseenrollment',
		COMMON_PREFIX + 'courseware.courseinstanceenrollment',
	]

	static Fields = {
		...Base.Fields,
		'CatalogEntry':           { type: 'model'   },
		'CourseProgress':         { type: 'model'   },
		'LegacyEnrollmentStatus': { type: 'string'  },
		'RealEnrollmentStatus':   { type: 'string'  },
		'Username':               { type: 'string'  },
		'UserProfile':            { type: 'model'   },
		'Reports':                { type: 'model[]' },
		'LastSeenTime':           { type: 'date'    }
	}

	/** @private */
	CourseInstance = null;


	get title () {
		return this.CatalogEntry.Title;
	}


	get ProviderUniqueID () {
		return this.CatalogEntry.ProviderUniqueID;
	}

	get isScorm () {
		const courseInstanceLink = this.Links && this.Links.filter(x => x.rel === 'CourseInstance')[0];

		return courseInstanceLink && courseInstanceLink.type && courseInstanceLink.type.match(/scormcourseinstance/);
	}

	get hasCompletionAcknowledgmentRequest () {
		return this.hasLink(ACKNOWLEDGE);
	}


	async acknowledgeCourseCompletion () {
		await this.postToLink(ACKNOWLEDGE);
		await this.refresh();
	}


	getPresentationProperties () {
		//Called by library view... The version in Course Instance is called on by everything else.
		let cce = this.CatalogEntry || EMPTY_CATALOG_ENTRY;

		return {
			author: cce.getAuthorLine(),
			title: cce.Title,
			label: cce.ProviderUniqueID,
		};
	}


	drop () {
		return this[Service].delete(this.href);
	}


	getCourseID () {
		return this.getLinkProperty('CourseInstance', 'ntiid');
	}


	getStatus () {
		return this.LegacyEnrollmentStatus;
	}


	hasCompletedItems () {
		return this.hasLink('CompletedItems');
	}


	async getCompletedItems () {
		try {
			const completedItems = await this.fetchLink('CompletedItems');

			return completedItems.Items;
		} catch (e) {
			return {};
		}
	}


	async updateCourseProgress () {
		try {
			const courseProgress = await this.fetchLinkParsed('Progress');

			this.CourseProgress = courseProgress;
			this.onChange('CourseProgress');
		} catch (e) {
			//Its alright if this fails
		}
	}

	/**
	 * @private
	 * @param {Instance} instance Course Instance
	 * @returns {void}
	 */
	setCourseInstance (instance) {
		this.CourseInstance = instance;
	}


	async getScopedCourseInstance () {
		const course = await this.fetchLinkParsed('CourseInstance');
		course[SCOPED_COURSE_INSTANCE] = true;
		return course;
	}
}

export default decorate(Enrollment, {with:[
	model,
	mixin(
		CourseIdentity,
		EnrollmentIdentity,
		forward([
			'getEndDate',
			'getStartDate'
		//From:
		], 'CatalogEntry')
	),
]});
