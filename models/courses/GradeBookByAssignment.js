import Base from '../Base';
import {
	Parser as parse
} from '../../CommonSymbols';

export default class GradeBookByAssignmentSummary extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);

		this[parse]('Items');
	}
}
