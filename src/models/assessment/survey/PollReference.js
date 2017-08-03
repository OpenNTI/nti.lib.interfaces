import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
class PollReference extends Base {
	static MimeType = COMMON_PREFIX + 'pollref'

	constructor (service, parent, data) {
		super(service, parent, data);
	}
}
