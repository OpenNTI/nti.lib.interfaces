import {forward} from 'nti-commons';
import {mixin} from 'nti-lib-decorators';

import { Service } from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

import CourseIdentity from './mixins/CourseIdentity';
import EnrollmentIdentity from './mixins/EnrollmentIdentity';

@model
@mixin(
	CourseIdentity,
	EnrollmentIdentity,
	forward([
		'containsPackage',
		'getOutline',
		'getPresentationProperties',
		'getDefaultShareWithValue',
		'getDiscussions',
		'hasDiscussions'
	//From:
	], 'CourseInstance'),
	forward([
		'getEndDate',
		'getStartDate'
	//From:
	], 'CourseInstance.CatalogEntry')
)
export default class Enrollment extends Base {
	static MimeType = [
		COMMON_PREFIX + 'courses.courseenrollment',
		COMMON_PREFIX + 'courseware.courseinstanceenrollment',
	]

	static Fields = {
		...Base.Fields,
		'CourseInstance':         { type: 'model'  },
		'LegacyEnrollmentStatus': { type: 'string' },
		'Reports':                { type: 'model[]'}
	}

	constructor (service, data) {
		super(service, null, data);

		if (!this.CourseInstance) {
			throw new Error('Illegal State: No CourseInstance. (You are probably trying to parse a GradeBookSummary or Roster)');
		}

		this.CourseInstance.on('change', this.onChange.bind(this));

		this.addToPending(this.CourseInstance);
	}


	get title () {
		return this.CourseInstance.title;
	}


	get ProviderUniqueID () {
		return this.CourseInstance.ProviderUniqueID;
	}


	drop () {
		return this[Service].delete(this.href);
	}


	getCourseID () {
		return this.CourseInstance.getID();
	}


	getStatus () {
		return this.LegacyEnrollmentStatus;
	}
}
