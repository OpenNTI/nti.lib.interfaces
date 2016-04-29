import {Parser as parse} from '../../constants';
import Base from '../Base';

export default class OutlineNodeProgress extends Base {

	constructor (service, parent, data) {
		super(service, parent, data);

		let {Items} = this;
		for (let o of Object.keys(Items)) {
			Items[o] = this[parse](Items[o]);
			if (!Items[o] || !Items[o][parse]) {
				//Item did not parse!
				delete Items[o];
			}
		}
	}


	getProgress (ntiid) {
		return this.Items[ntiid];
	}
}
