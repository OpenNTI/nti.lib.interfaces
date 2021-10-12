import Base from '../../Base.js';
import Registry, { COMMON_PREFIX } from '../../Registry.js';

/** @typedef {import('../../stores/Service').default} ServiceDocument */

export default class AddressProperty extends Base {
	static MimeType = COMMON_PREFIX + 'users.address';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'full_name': {type: 'string'},
		'street_address_1': {type: 'string'},
		'street_address_2': {type: 'string'},
		'city': {type: 'string'},
		'state': {type: 'string'},
		'postal_code': {type: 'string'},
		'country': {type: 'string'}
	}
}

Registry.register(AddressProperty);
