import Base from '../../Base';
import {Parser as parse} from '../../../constants';

export default class LeasonOverview extends Base {

	constructor (service, parent, data) {
		super(service, parent, data);
		this[parse]('Items');
	}
}
