import Logger from '@nti/util-logger';

import { Service, DELETED, SAVE } from '../constants.js';
import { begin, finishers } from '../utils/events-begin-finish.js';

const logger = Logger.get('models:Editable');

const after = (task, call) => task.catch(() => {}).then(() => call());

const PHANTOM = Symbol.for('Phantom');

/**
 * @template {import('../types').Constructor} T
 * @param {T} Base
 * @mixin
 */
export default Base =>
	class Editable extends Base {
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
				this.fetchLink({ method: 'put', mode: 'raw', rel, data })
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
				this.fetchLink({
					method: 'put',
					mode: 'raw',
					rel,
					data: values,
				})
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

		get isModifiable() {
			const maybeNewObject = !this.Links && !this.href;
			if (maybeNewObject && !this[PHANTOM]) {
				logger.warn(
					'%s:\n\tObject declared Modifiable because it might be a new object... %o',
					'FIXME: Use item[Symbol.for(`Phantom`)] = true to declare this as a new object',
					this
				);
			}
			return (
				this[PHANTOM] || //declared a new object that has yet to be posted to the server
				this.hasLink('edit') || //has an edit link.
				//TODO: remove this clause once all the warnings have been addressed.
				maybeNewObject
			); //or ambiguous case: its a new object? or not.
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
