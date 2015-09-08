import Base from './Base';

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


		let resolving = this.value.map(v => service.resolveEntity(v).catch(()=> v));

		Promise.all(resolving).then(v => Object.assign(this.value, v));

		this.addToPending(...resolving);
	}

}
