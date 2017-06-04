import {model, COMMON_PREFIX} from '../Registry';

import Base from './Base';

@model
export default class ContentPointer extends Base {
	static MimeType = COMMON_PREFIX + 'contentrange.contentpointer'

	constructor (service, parent, data, ...mixins) {
		super(service, parent, data, {Class: 'ContentPointer'}, ...mixins);
	}
}
