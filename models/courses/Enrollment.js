import Base from '../Base';
import {
	Parser as parse,
	Service
} from '../../CommonSymbols';

import forwardFunctions from '../../utils/function-forwarding';


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

		i.on('change', this.onChange.bind(this));
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
