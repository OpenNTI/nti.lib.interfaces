import pluck from 'nti-commons/lib/pluck';

import { Service, DELETED, SAVE } from '../../constants';

import {begin, finishers} from '../../utils/events-begin-finish';


export default {
	delete () {
		if (!this.hasLink('edit')) {
			return Promise.reject('No Edit Link.');
		}

		begin(this, DELETED);

		return this[Service].delete(this.href)
			.then(() => this.onChange(DELETED, this.getID()))
			.then(...finishers(this, DELETED))
			.then(() => true);//control the success result
	},

	save (newValues, onAfterRefresh = x=>x) {
		if (!this.hasLink('edit')) {
			return Promise.reject('No Edit Link.');
		}

		let keys = [...Object.keys(newValues), 'NTIID', 'Links'];

		this.savingValues = newValues;

		begin(this, SAVE);

		return this.putToLink('edit', newValues)
			.then(o => this.refresh(pluck(o, ...keys)))
			.then(onAfterRefresh)
			.then(...finishers(this, SAVE))
			.then(() => this.onChange(keys));
	}
};
