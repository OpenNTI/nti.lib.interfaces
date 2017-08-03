import {Parser as parse} from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class OutlineNodeProgress extends Base {
	static MimeType = [
		COMMON_PREFIX + 'courseoutlinenodeprogress',
		COMMON_PREFIX + 'progresscontainer',
	]

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
