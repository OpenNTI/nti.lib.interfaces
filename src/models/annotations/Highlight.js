import { Parser as parse } from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';

import Annotation from './Annotation';

export default
@model
class Highlight extends Annotation {
	static MimeType = COMMON_PREFIX + 'highlight'

	constructor (service, parent, data) {
		super(service, parent, data);

		this[parse]('applicableRange');
	}

}
