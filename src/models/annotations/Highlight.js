import { Parser as parse } from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';

import Annotation from './Annotation';

@model
export default class Highlight extends Annotation {
	static MimeType = COMMON_PREFIX + 'highlight'

	constructor (service, parent, data, ...mixins) {
		super(service, parent, data, ...mixins);

		this[parse]('applicableRange');
	}

}
