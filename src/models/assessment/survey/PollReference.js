import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';

export default class PollReference extends Base {
	static MimeType = COMMON_PREFIX + 'pollref';
}

Registry.register(PollReference);
