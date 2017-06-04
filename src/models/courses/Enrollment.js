import {forward} from 'nti-commons';

import { Parser as parse, Service } from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

@model
export default class Enrollment extends Base {
	static MimeType = [
		COMMON_PREFIX + 'courses.courseenrollment',
		COMMON_PREFIX + 'courseware.courseinstanceenrollment',
	]

	constructor (service, data) {
		super(service, null, data,
			{
				isCourse: true,
				isEnrollment: true
			},

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
			], 'CourseInstance.CatalogEntry'));


		let i = this[parse]('CourseInstance');

		if (!i) {
			throw new Error('Illegal State: No CourseInstance. (You are probably trying to parse a GradeBookSummary or Roster)');
		}

		this.addToPending(i.waitForPending());
		i.on('change', this.onChange.bind(this));
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
