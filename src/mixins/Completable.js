import Logger from '@nti/util-logger';

import CompletedItem from '../models/courses/CompletedItem.js';

const logger = Logger.get('mixins:Completable');

function getCompletedDate(item, items) {
	return (
		items &&
		(items[item.NTIID] ||
			items[item.href] ||
			items[item['Target-NTIID']] ||
			items[item['target-NTIID']])
	);
}

/**
 * @template {import('../types').Constructor} T
 * @param {T} Base
 * @mixin
 */
export default Base =>
	class Completable extends Base {
		// prettier-ignore
		static Fields = {
			...super.Fields,
			CompletedItem:            { type: 'model'                           },
			CompletionRequired:       { type: 'boolean'                         },
			CompletionDefaultState:   { type: 'boolean'                         },
			IsCompletionDefaultState: { type: 'boolean'                         },
			CompletedDate:            { type: 'date',   name: '__CompletedDate' },
		};

		constructor(...args) {
			super(...args);
			this.addListener('incoming-change', change => {
				if (change.Item instanceof CompletedItem) {
					this.updateCompletedItem(change.Item);
				}
			});
		}

		__isSocketChangeEventApplicable(change) {
			return (
				super.__isSocketChangeEventApplicable(change) ||
				this.getID() === change.Item.ItemNTIID
			);
		}

		getCompletedDate() {
			return (
				this.CompletedItem?.getCompletedDate() ??
				this.get_CompletedDate()
			);
		}

		isCompletable() {
			// if this key exists, the object was decorated with completion fields
			// this should only happen within courses that are maked as completable
			return Object.keys(this.__toRaw()).includes('CompletionRequired');
		}

		hasCompleted() {
			return this.getCompletedDate() != null;
		}

		completedSuccessfully() {
			return this.CompletedItem?.Success;
		}

		completedUnsuccessfully() {
			return !this.CompletedItem?.Success;
		}

		getPercentageCompleted() {
			//TODO: fill this out
			return 0;
		}

		async updateCompletedItem(item) {
			if (!item) {
				return this.refresh();
			}

			this.CompletedItem = item;
		}

		async updateCompletedState(enrollment) {
			enrollment = enrollment || this.parent('getCompletedItems');

			if (!enrollment?.hasCompletedItems?.()) {
				return;
			}

			try {
				const items = await enrollment.getCompletedItems();
				const oldCompletedDate = this.getCompletedDate();
				const completedDate = getCompletedDate(this, items);

				this.__CompletedDate = completedDate;
				if (this.CompletedItem) {
					this.CompletedItem.CompletedDate = completedDate;
				}
				this.onChange('CompletedDate');

				if (oldCompletedDate !== this.getCompletedDate()) {
					enrollment.updateCourseProgress?.();
				}

				return this;
			} catch (e) {
				logger.stack(e);
			}
		}
	};
