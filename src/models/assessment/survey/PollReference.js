import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';

class PollReference extends Base {
	static MimeType = COMMON_PREFIX + 'pollref';
}

export default decorate(PollReference, { with: [model] });
