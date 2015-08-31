import Base from '../Base';
import {Parser as parse} from '../../CommonSymbols';
export default class CourseRecursiveStreamBucket extends Base {

	constructor (service, data) {
		super(service, null, data);
		this[parse]('Items');
	}

}
