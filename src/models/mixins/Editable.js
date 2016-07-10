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

		const data = {
			fields: newValues
		};

		begin(this, SAVE);

		this.saving = this.putToLink('edit', newValues)
			.then(o => this.refresh(pluck(o, ...keys), o))
			.then(o => (onAfterRefresh(o), o))
			.then(...finishers(this, SAVE, data))
			.then(() => this.onChange(keys));

		const clean = () => delete this.saving;

		this.saving.values = newValues;
		this.saving.then(clean, clean);

		return this.saving;
	}
};
