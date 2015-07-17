import pluck from '../../utils/pluck';

import { Service, DELETED } from '../../CommonSymbols';

export default {
	delete () {
		if (!this.hasLink('edit')) {
			return Promise.reject('No Edit Link.');
		}

		return this[Service].delete(this.href)
			.then(() => this.onChange(DELETED, this.getID()))
			.then(() => true);//control the success result
	},

	save (newValues) {
		if (!this.hasLink('edit')) {
			return Promise.reject('No Edit Link.');
		}

		let keys = [...Object.keys(newValues), 'NTIID'];

		return this.putToLink('edit', newValues)
			.then(o => this.refresh(pluck(o, ...keys)))
			.then(() => this.onChange(keys));
	}
};
