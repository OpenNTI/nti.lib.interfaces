import Batch from '../../data-sources/data-types/Batch.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';

export class SiteSegments extends Batch {
	static MimeType = COMMON_PREFIX + 'segments.sitesegments';
}

Registry.register(SiteSegments);
