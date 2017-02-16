import Base from '../Base';
import {
	Service
} from '../../constants';


export default class RenderablePackage extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);
	}


	getContents () {
		return this.requestLink('contents', 'get');
	}
}
