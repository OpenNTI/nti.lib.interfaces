import { model, COMMON_PREFIX } from '../Registry';

import Annotation from './Annotation';

export default
@model
class Bookmark extends Annotation {
	static MimeType = COMMON_PREFIX + 'bookmark';
}
