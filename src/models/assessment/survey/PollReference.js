import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

@model
export default class PollReference extends Base {
	static MimeType = COMMON_PREFIX + 'pollref'

	constructor (service, parent, data) {
		super(service, parent, data);
	}
}
