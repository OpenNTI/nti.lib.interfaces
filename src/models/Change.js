import {Parser as parse} from '../constants';

import {model, COMMON_PREFIX} from './Registry';
import Base from './Base';

@model
export default class Change extends Base {
	static MimeType = COMMON_PREFIX + 'change'

	constructor (service, parent, data) {
		super(service, parent, data);
		this[parse]('Item');
	}
}
