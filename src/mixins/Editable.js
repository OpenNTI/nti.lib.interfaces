import { Service, DELETED, SAVE } from '../constants';
import {begin, finishers} from '../utils/events-begin-finish';

const after = (task, call) => task.catch(()=>{}).then(()=>call());


export default {
	delete (rel = 'edit') {
		const link = this.getLink(rel);

		if (!link) {
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

		const {...values} = newValues;

		for(let x of Object.keys(values)) {
			//Add Unique keys to the refresh queue...
			//If the key is a renamed key, map it back.
			const {get} = Object.getOwnPropertyDescriptor(this, x) || {};
			const originalName = get && get.renamedFrom;
			const value = values[x];

			if (originalName) {
				// console.debug('Restoring renamed value "%s" to "%s"', x, originalName);
				if (x in values) {
					delete values[x];
					values[originalName] = value;
				}
			}
		}

		begin(this, SAVE);

		const previousSave = this.saving || Promise.resolve();

		let keys = null;
		const worker = this.saving = after(previousSave, () => this.putToLink(rel, values))
			.then(o => (keys = Object.keys(), this.refresh(o)))
			.then(o => (onAfterRefresh(o), o))
			.then(...finishers(this, SAVE, { fields: values }))
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


	/**
	 * isModifiable
	 * @deprecated
	 * @return {bool} isModifiable
	 */
	canEdit () {
		console.warn('Use isModifiable instead of canEdit()');//eslint-disable-line no-console
		return this.isModifiable;
	}
};
