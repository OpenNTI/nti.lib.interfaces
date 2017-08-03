import {Parser as parse} from '../../../constants';
import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
class VideoRoll extends Base {
	static MimeType = COMMON_PREFIX + 'videoroll'

	constructor (service, parent, data) {
		super(service, parent, data);
		this[parse]('Items');
	}
}
