/**
 * This is for Objects within an assignment history item.
 */

import { isNTIID } from '@nti/lib-ntiids';

import { Service } from '../constants.js';
import getLink from '../utils/get-link.js';

/**
 * @template {new (...args: any[]) => {}} T
 * @param {T} Base
 * @mixin
 */
export default Base =>
	class extends Base {
		constructor(...args) {
			super(...args);

			const service = this[Service];

			const resolveAssignmentTitle = async () => {
				//If this model has an assignment parent model instance,
				let assignment = this.parent(
					'MimeType',
					/assessment.assignment$/i
				);
				if (!assignment) {
					//Otherwise, load the assignment object
					assignment = await service.getObjectRaw(this.AssignmentId);
				}
				//then... Pluck the assignment object title...
				this.AssignmentName = assignment.title;
			};

			const resolveCatalogItem = async () => {
				let catalogEntryUrl = this.CatalogEntryNTIID;

				if (!catalogEntryUrl) {
					const courseInstanceUrl = (
						this.getLink('AssignmentHistoryItem') ||
						this.href ||
						''
					).replace(/\/AssignmentHistories.*/, '');

					if (!courseInstanceUrl) {
						throw new Error('No Course URL');
					}

					const courseInstanceData = await service.get(
						courseInstanceUrl
					);
					catalogEntryUrl = getLink(
						courseInstanceData,
						'CourseCatalogEntry'
					);
				}

				if (!catalogEntryUrl) {
					throw new Error('No Catalog Entry URL');
				}

				const call = _ => service[isNTIID(_) ? 'getObject' : 'get'](_);

				const catalogEntry = await call(catalogEntryUrl);

				//Okay, the scary part is over! just grab what we need and run.
				this.CourseName = catalogEntry.Title;
				this.CatalogEntry = catalogEntry;
			};

			this.addToPending(
				(async () => {
					//Wait on the two async operations (a and b), then fire a change
					// event so views know values changed.
					await Promise.allSettled([
						resolveAssignmentTitle(),
						resolveCatalogItem().catch(reason => {
							// eslint-disable-next-line no-console
							console.warn(
								`Could not resolve catalog item. This object will not have CourseName and CatalogEntry keys.\nReason: %o`,
								reason.message || reason
							);
						}),
					]);

					this.emit('change');
				})()
			);
		}
	};
