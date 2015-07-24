import Base from '../Base';

import {
	Parser as parse
} from '../../CommonSymbols';

export default class InqueryItem extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);

		//CatalogEntryNTIID
		this[parse]('Submission');
	}
}
