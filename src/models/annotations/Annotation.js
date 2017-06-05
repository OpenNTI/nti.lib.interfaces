import {mixin} from 'nti-lib-decorators';

import {Service} from '../../constants';
import Likable from '../../mixins/Likable';
import Base from '../Base';

@mixin(Likable)
export default class Annotation extends Base {

	constructor (service, parent, data) {
		super(service, parent, data);
	}


	getContainerID () {
		return this.ContainerId;
	}


	getContextData () {
		// return this[Service].get('/mobile/api/ugd/context-data/' + encodeURIComponent(this.getID()));
		return this[Service].getObject(this.getContainerID());
	}
}
