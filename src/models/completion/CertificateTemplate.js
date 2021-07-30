import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export class CertificateTemplate extends Base {
	static MimeType = [COMMON_PREFIX + 'completion.certificatetemplate'];

	// prettier-ignore
	static Fields = {
		...super.Fields,
	}

	get thumbnailUrl() {
		console.warn('FIXME: using placeholder certificate thumbnail');
		return '//placekitten.com/550/425';
	}
}

Registry.register(CertificateTemplate);
