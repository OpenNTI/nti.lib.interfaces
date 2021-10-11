import { SCOPED_COURSE_INSTANCE, Service } from '../../constants.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

import CourseIdentity from './mixins/CourseIdentity.js';
import EnrollmentIdentity from './mixins/EnrollmentIdentity.js';

const emptyFunction = () => {};
const EMPTY_CATALOG_ENTRY = { getAuthorLine: emptyFunction };
const ACKNOWLEDGE = 'AcknowledgeCompletion';

export default class Enrollment extends CourseIdentity(
	EnrollmentIdentity(Base)
) {
	static MimeType = [
		COMMON_PREFIX + 'courses.courseenrollment',
		COMMON_PREFIX + 'courseware.courseinstanceenrollment',
	];

	// prettier-ignore
	static Fields = {
		...super.Fields,
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

	getEndDate() {
		return this.CatalogEntry.getEndDate();
	}
	getStartDate() {
		return this.CatalogEntry.getStartDate();
	}

	get title() {
		return this.CatalogEntry.Title;
	}

	get ProviderUniqueID() {
		return this.CatalogEntry.ProviderUniqueID;
	}

	get isScorm() {
		const courseInstanceLink =
			this.Links && this.Links.filter(x => x.rel === 'CourseInstance')[0];

		return (
			courseInstanceLink &&
			courseInstanceLink.type &&
			courseInstanceLink.type.match(/scormcourseinstance/)
		);
	}

	get hasCompletionAcknowledgmentRequest() {
		return this.hasLink(ACKNOWLEDGE);
	}

	async acknowledgeCourseCompletion() {
		await this.postToLink(ACKNOWLEDGE);
		await this.refresh();
	}

	get isForAppUser() {
		return this[Service].getAppUsername() === this.Username;
	}

	getPresentationProperties() {
		//Called by library view... The version in Course Instance is called on by everything else.
		let cce = this.CatalogEntry || EMPTY_CATALOG_ENTRY;

		return {
			author: cce.getAuthorLine(),
			title: cce.Title,
			label: cce.ProviderUniqueID,
		};
	}

	drop() {
		return this[Service].delete(this.href);
	}

	getCourseID() {
		return this.getLinkProperty('CourseInstance', 'ntiid');
	}

	getStatus() {
		return this.LegacyEnrollmentStatus;
	}

	hasCompletedItems() {
		return this.hasLink('CompletedItems');
	}

	async getCompletedItems() {
		try {
			const completedItems = await this.fetchLink({
				rel: 'CompletedItems',
				mode: 'raw',
			});

			return completedItems.Items;
		} catch (e) {
			return {};
		}
	}

	async updateCourseProgress() {
		try {
			const courseProgress = await this.fetchLink('Progress');

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
	setCourseInstance(instance) {
		this.CourseInstance = instance;
	}

	async getScopedCourseInstance() {
		const course = await this.fetchLink('CourseInstance');
		course[SCOPED_COURSE_INSTANCE] = true;
		return course;
	}
}

Registry.register(Enrollment);
