import { Service, DELETED, SAVE } from '../constants.js';
import { begin, finishers } from '../utils/events-begin-finish.js';

const after = (task, call) => task.catch(() => {}).then(() => call());

/**
 * @template {import('../constants').Constructor} T
 * @param {T} Base
 * @mixin
 */
export const mixin = Base =>
	class extends Base {
		/**
		 * @template T
		 * @param {T} editableThing
		 * @returns {T}
		 */
		static getStagingInstance(editableThing) {
			const Type = this;
			if (Type !== editableThing.constructor) {
				throw new Error('Incompatible Type.');
			}

			class StagingInstance extends Type {
				getEventPrefix() {
					return super.getEventPrefix() + '--staged';
				}

				async save(...args) {
					const res = await super.save(...args);
					editableThing.refresh(this.toJSON());
					return res;
				}
			}

			return new StagingInstance(
				editableThing[Service],
				null,
				editableThing.toJSON?.()
			);
		}

		getStagingInstance() {
			return this.constructor.getStagingInstance(this);
		}

		async delete(rel) {
			if (!rel) {
				rel = ['delete', 'edit'].find(x => this.hasLink(x)) ?? '';
			}

			const link = this.getLink(rel);

			if (!link) {
				throw new Error(`No ${rel || 'delete or edit'} Link`);
			}

			begin(this, DELETED);

			const previousSave = this.saving || Promise.resolve();

			const worker = (this.deleting = after(previousSave, () =>
				this[Service].delete(link)
			));

			const clean = () => {
				if (this.deleting === worker) {
					delete this.deleting;
				}
			};

			worker.then(clean, clean);

			this.onChange('deleting');

			return worker
				.then(o => (this.afterDelete?.(o), o))
				.then(() => this.onChange(DELETED, this.getID()))
				.then(...finishers(this, DELETED))
				.then(() => true); //control the success result
		}

		async saveFormData(data, onAfterRefresh = x => x, rel = 'edit') {
			if (!this.hasLink(rel)) {
				throw new Error(`No ${rel} Link`);
			}

			begin(this, SAVE);

			const previousSave = this.saving || Promise.resolve();

			const worker = (this.saving = after(previousSave, () =>
				this.putToLink(rel, data)
			)
				.then(o => this.refresh(o).then(() => o))
				.then(o => (onAfterRefresh?.(this, o), o))
				.then(...finishers(this, SAVE))
				.then(() => this.onChange()));

			const clean = () => {
				if (this.saving === worker) {
					delete this.saving.data;
					delete this.saving;
				}
			};

			this.saving.data = data;
			this.saving.then(clean, clean);

			this.onChange('saving');

			return this.saving;
		}

		async save(
			newValues = this.getData({ diff: 'shallow' }),
			onAfterRefresh = x => x,
			rel = 'edit'
		) {
			if (newValues instanceof FormData) {
				return this.saveFormData(newValues, onAfterRefresh, rel);
			}

			if (!this.hasLink(rel)) {
				throw new Error(`No ${rel} Link`);
			}

			const { ...values } = newValues;
			const savingKeys = Object.keys(values);

			for (let x of savingKeys) {
				//Add Unique keys to the refresh queue...
				//If the key is a renamed key, map it back.
				const { get } = Object.getOwnPropertyDescriptor(this, x) || {};
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
			const worker = (this.saving = after(previousSave, () =>
				this.putToLink(rel, values)
			)
				.then(
					o => (
						(o = ensureSavingKeysOn(o, savingKeys)),
						(keys = Object.keys(o)),
						this.refresh(o).then(() => o)
					)
				)
				.then(o => (onAfterRefresh?.(this, o), o))
				.then(...finishers(this, SAVE, { fields: values }))
				.then(() => this.onChange(keys)));

			const clean = () => {
				if (this.saving === worker) {
					delete this.saving.values;
					delete this.saving;
				}
			};

			const otherQueued = (this.saving || {}).values || {};

			this.saving.values = { ...otherQueued, ...values };
			this.saving.then(clean, clean);

			this.onChange('saving');

			await this.saving;
			return this;
		}

		/**
		 * Checks if this is modifiable
		 *
		 * @deprecated
		 * @returns {boolean} isModifiable
		 */
		canEdit() {
			return this.isModifiable;
		}
	};

/**
 * Make sure the fields we are saving are keys on the object we refresh with
 *
 * @param  {Object} o          the object we are going to update with
 * @param  {string} savingKeys the keys we tried to save
 * @returns {Object}            the object to update with including all the saved keys
 */
function ensureSavingKeysOn(o, savingKeys) {
	for (let key of savingKeys) {
		if (!Object.prototype.hasOwnProperty.call(o, key)) {
			o[key] = undefined;
		}
	}

	return o;
}
