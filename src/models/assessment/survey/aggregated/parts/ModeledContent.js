import Base from './Part';
// import {Parser as parse} from '../../../../../constants';

export default class AggregatedModeledContentPart extends Base {

	constructor (service, parent, data) {
		super(service, parent, data);
	}


	getResults () {
		const {Results: results} = this;
		return results;
	}
}
