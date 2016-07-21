import pluck from 'nti-commons/lib/pluck';

import { Service, DELETED, SAVE, MAY_EFFECT_PROPERTIES } from '../../constants';

import {begin, finishers} from '../../utils/events-begin-finish';

const after = (task, call) => task.catch(()=>{}).then(()=>call());


export default {
	delete () {
		if (!this.hasLink('edit')) {
			return Promise.reject('No Edit Link.');
		}

		begin(this, DELETED);

		const previousSave = this.saving || Promise.resolve();

		return after(previousSave, ()=> this[Service].delete(this.href))
			.then(() => this.onChange(DELETED, this.getID()))
			.then(...finishers(this, DELETED))
			.then(() => true);//control the success result
	},

	save (newValues, onAfterRefresh = x=>x) {
		if (!this.hasLink('edit')) {
			return Promise.reject('No Edit Link.');
		}

		const {[MAY_EFFECT_PROPERTIES]: additionKeys, ...values} = newValues;

		const keys = ['NTIID', 'Links', 'Last Modified'];

		[...Object.keys(values), ...(additionKeys || [])]
			.forEach(x => !keys.includes(x) && keys.push(x));

		const data = {
			fields: values
		};

		begin(this, SAVE);

		const previousSave = this.saving || Promise.resolve();

		const worker = this.saving = after(previousSave, () => this.putToLink('edit', values))
			.then(o => this.refresh(pluck(o, ...keys)))
			.then(o => (onAfterRefresh(o), o))
			.then(...finishers(this, SAVE, data))
			.then(() => this.onChange(keys));

		const clean = () => {
			if (this.saving === worker) {
				delete this.saving.values;
				delete this.saving;
			}
		};

		const otherQueued = (this.saving || {}).values || {};

		this.saving.values = {...otherQueued, ...values};
		this.saving.then(clean, clean);

		return this.saving;
	}
};
