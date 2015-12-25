import Annotation from './Annotation';

import { Parser as parse } from '../../constants';

export default class Highlight extends Annotation {

	constructor (service, parent, data, ...mixins) {
		super(service, parent, data, ...mixins);

		this[parse]('applicableRange');
	}

}
