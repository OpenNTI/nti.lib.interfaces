import pluck from '../../utils/pluck';

import { Service, DELETED } from '../../constants';

export default {
	delete () {
		if (!this.hasLink('edit')) {
			return Promise.reject('No Edit Link.');
		}

		return this[Service].delete(this.href)
			.then(() => this.onChange(DELETED, this.getID()))
			.then(() => true);//control the success result
	},

	save (newValues, onAfterRefresh = x=>x) {
		if (!this.hasLink('edit')) {
			return Promise.reject('No Edit Link.');
		}

		let keys = [...Object.keys(newValues), 'NTIID', 'Links'];

		return this.putToLink('edit', newValues)
			.then(o => this.refresh(pluck(o, ...keys)))
			.then(onAfterRefresh)
			.then(() => this.onChange(keys));
	}
};
