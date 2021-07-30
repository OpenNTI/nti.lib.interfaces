import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class CompletionPolicy extends Base {
	static MimeType = [COMMON_PREFIX + 'completion.aggregatecompletionpolicy'];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'percentage':                    { type: 'number' },
		'offers_completion_certificate': { type: 'boolean', name: 'offersCompletionCertificate' },
		'CertificateTemplateNTIID':      { type: 'string' },
	}
}

Registry.register(CompletionPolicy);
