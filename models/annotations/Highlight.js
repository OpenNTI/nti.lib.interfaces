import Annotation from './Annotation';

import { Parser as parse } from '../../CommonSymbols';

export default class Highlight extends Annotation {

	constructor (service, parent, data) {
		super(service, parent, data);

		this[parse]('applicableRange');
	}

}
