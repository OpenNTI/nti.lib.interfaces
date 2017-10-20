import {model, COMMON_PREFIX} from '../Registry';

import Purchasable from './Purchasable';

export default
@model
class PurchasableCourse extends Purchasable {
	static MimeType = COMMON_PREFIX + 'store.purchasablecourse'

	static Fields = {
		...Purchasable.Fields,
		'ID': { type: 'string' }
	}
}
