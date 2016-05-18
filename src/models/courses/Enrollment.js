import Base from '../Base';
import {
	Parser as parse,
	Service
} from '../../constants';

import forwardFunctions from 'nti-commons/lib/function-forwarding';


export default class Enrollment extends Base {
	constructor (service, data) {
		super(service, null, data,
			{
				isCourse: true,
				isEnrollment: true
			},

			forwardFunctions([
				'containsPackage',
				'getOutline',
				'getPresentationProperties',
				'getDefaultShareWithValue',
				'getDiscussions',
				'hasDiscussions'
			//From:
			], 'CourseInstance'),

			forwardFunctions([
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
