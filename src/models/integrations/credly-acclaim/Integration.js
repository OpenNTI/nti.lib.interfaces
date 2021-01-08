import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../../Registry';
import BaseIntegration from '../Integration';

const ConnectRel = 'enable';

class CredlyAcclaimIntegration extends BaseIntegration {
	static MimeType = [
		COMMON_PREFIX + 'site.acclaimintegration'
	]

	name = 'credly-acclaim'
	isCredilyAcclaimIntegration = true

	isEnabled () {

	}

	isConnected () {

	}

	canConnect () {
		return this.hasLink(ConnectRel);
	}

	canDisconnect () {

	}
}

export default decorate(CredlyAcclaimIntegration, {with: [model]});
