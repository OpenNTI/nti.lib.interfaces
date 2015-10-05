import Base from '../../Base';
import {Parser as parse} from '../../../CommonSymbols';

export default class VideoSet extends Base {

	constructor (service, parent, data) {
		super(service, parent, data);
		this[parse]('Items');
	}
}
