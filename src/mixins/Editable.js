import {pluck} from 'nti-commons';

import { Service, DELETED, SAVE, MAY_EFFECT_PROPERTIES } from '../constants';

import {begin, finishers} from '../utils/events-begin-finish';

const after = (task, call) => task.catch(()=>{}).then(()=>call());


export default {
	delete () {
		const link = this.href || this.getLink('edit');

		if (!this.hasLink('edit') || !link) {
			return Promise.reject('No Edit Link.');
		}

		begin(this, DELETED);

		const previousSave = this.saving || Promise.resolve();

		return after(previousSave, ()=> this[Service].delete(link))
			.then(() => this.onChange(DELETED, this.getID()))
			.then(...finishers(this, DELETED))
			.then(() => true);//control the success result
	},

	save (newValues, onAfterRefresh = x=>x, rel = 'edit') {
		if (!this.hasLink(rel)) {
			return Promise.reject('No Edit Link.');
		}

		const {[MAY_EFFECT_PROPERTIES]: additionKeys, ...values} = newValues;

		const keys = ['NTIID', 'OID', 'Links', 'Last Modified'];

		[...Object.keys(values), ...(additionKeys || [])]
			//Add Unique keys to the refresh queue...
			//If the key is a renamed key, map it back.
			.forEach(x => {
				const {get} = Object.getOwnPropertyDescriptor(this, x) || {};
				const originalName = get && get.renamedFrom;
				const value = values[x];

				const key = originalName || x;
				if (!keys.includes(key)) {
					keys.push(key);
				}

				if (originalName) {
					// console.debug('Restoring renamed value "%s" to "%s"', x, originalName);
					if (x in values) {
						delete values[x];
						values[originalName] = value;
					}
				}
			});

		const data = {
			fields: values
		};

		begin(this, SAVE);

		const previousSave = this.saving || Promise.resolve();

		const worker = this.saving = after(previousSave, () => this.putToLink(rel, values))
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
	},


	canEdit () {
		return this.hasLink('edit');
	}
};
