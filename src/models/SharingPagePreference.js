import Base from './Base';

import {Service} from '../constants';

const TakeOver = Symbol.for('TakeOver');

export default class SharingPagePreference extends Base {

	constructor (service, parent, data) {
		super(service, parent, data);
		const rename = (x, y) => this[TakeOver](x, y);

		// Provenance: "tag:nextthought.com,2011-10:..."
		// State: "inherited"
		// sharedWith: ["..."]

		rename('Provenance', 'provenance');
		rename('State', 'state');
		rename('sharedWith', 'value');


		//For the sake of bandwidth, and data...etc... lets not pre-resolve these.
		//Lets wait until the user actually invokes a note editior.
		// this.resolveValueToEntities();
	}


	resolveValueToEntities () {
		//prevent re-entry
		this.resolveValueToEntities = () => this.waitForPending();

		let resolving = this.value.map(v =>
				typeof v !== 'string'
					? v
					: this[Service].resolveEntity(v).catch(()=> v));

		Promise.all(resolving)
			.then(v => Object.assign(this.value, v));

		return this.addToPending(...resolving).waitForPending();
	}
}
