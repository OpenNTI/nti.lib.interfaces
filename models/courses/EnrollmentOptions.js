import Base from '../Base';
import {
	Parser as parse
} from '../../CommonSymbols';


export default class EnrollmentOptions extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);

		console.log('Enrollment Options:', data);

		let {Items} = this;

		for (let key of Object.keys(Items)) {
			Items[key] = this[parse](Items[key]);
		}
	}

}
