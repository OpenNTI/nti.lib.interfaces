import {model, COMMON_PREFIX} from '../Registry';

import Annotation from './Annotation';

export default
@model
class Highlight extends Annotation {
	static MimeType = COMMON_PREFIX + 'highlight'

	static Fields = {
		...Annotation.Fields,
		'applicableRange': { type: 'model' }
	}
}
