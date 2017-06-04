import {Parser as parse} from '../../../constants';
import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

@model
export default class VideoRoll extends Base {
	static MimeType = COMMON_PREFIX + 'videoroll'

	constructor (service, parent, data) {
		super(service, parent, data);
		this[parse]('Items');
	}
}
