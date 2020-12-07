/**
 * This is for Objects within an assignment history item.
 */

import {Service} from '../constants';
import getLink from '../utils/getlink';

export default {

	initMixin () {
		const service = this[Service];

		const resolveAssignmentTitle = async () => {
			//If this model has an assignment parent model instance,
			let assignment = this.parent('MimeType', /assessment.assignment$/i);
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
				const courseInstanceUrl = (this.getLink('AssignmentHistoryItem') || this.href || '')
					.replace(/\/AssignmentHistories.*/, '');

				if (!courseInstanceUrl) {
					throw new Error('No Course URL');
				}

				const courseInstanceData = await service.get(courseInstanceUrl);
				catalogEntryUrl = getLink(courseInstanceData, 'CourseCatalogEntry');
			}

			if (!catalogEntryUrl) {
				throw new Error('No Catalog Entry URL');
			}

			const catalogEntry = await service.getObject(catalogEntryUrl);

			//Okay, the scary part is over! just grab what we need and run.
			this.CourseName = catalogEntry.Title;
			this.CatalogEntry = catalogEntry;
		};


		this.addToPending((async () => {
			//Wait on the two async operations (a and b), then fire a change
			// event so views know values changed.
			await Promise.all([
				resolveAssignmentTitle(),
				resolveCatalogItem(),
			]);

			this.emit('change');
		})());
	}

};
