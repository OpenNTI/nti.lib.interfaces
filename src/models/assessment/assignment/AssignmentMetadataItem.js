import Base from '../../Base';
import {
	DateFields,
} from '../../../constants';

export default class AssignmentMetadataItem extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);

		//Known Properties:
		//"Duration": 3.088913917541504 (seconds)
		//"StartTime": 1472757779.084985 (timestamp) -- use getStartTime() to get a Date object.
	}

	[DateFields] () {
		return super[DateFields]().concat([
			'StartTime',//becomes getStartTime() which will return the Date object representation
		]);
	}


	//for symmetry, define a 'getDuration'
	getDuration () {
		return this.Duration;
	}
}
