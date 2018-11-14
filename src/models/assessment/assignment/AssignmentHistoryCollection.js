import {pluck} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
class AssignmentHistoryCollection extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.userscourseassignmenthistory'

	static Fields = {
		...Base.Fields,
		'lastViewed':                { type: 'date'     },
		'AvailableAssignmentNTIIDs': { type: 'string[]' },
		'Items':                     { type: 'model{}'  },
	}


	isRelevantFor (ntiid) {
		const {AvailableAssignmentNTIIDs: ids} = this;
		if (!Array.isArray(ids)) {
			return true; //backwards compat
		}

		return ids.indexOf(ntiid) >= 0;
	}


	[Symbol.iterator] () {
		let snapshot = Object.values(this.Items);
		let {length} = snapshot;
		let index = 0;

		return {

			next () {
				let done = index >= length;
				let value = snapshot[index++];

				return { value, done };
			}

		};
	}


	map (fn) {
		return Array.from(this).map(fn);
	}


	getItem (assignmentId) {
		return this.Items[assignmentId];
	}


	setItem (assignmentId, historyItem) {
		const {Items: items} = this;
		const historySubItem = historyItem && historyItem.getMostRecentHistoryItem && historyItem.getMostRecentHistoryItem();
		const newItemAssignmentId = ((historySubItem || {}).grade || {}).AssignmentId;

		if (historyItem && newItemAssignmentId !== assignmentId) {
			throw new Error('HistoryItem does not match the Assignment');
		}

		const existing = items[assignmentId];
		if (existing && historyItem) {
			if (historyItem.getLastModified() <= existing.getLastModified()) {
				return;
			}
		}

		if (!historyItem) {
			if (items[assignmentId]) {
				items[assignmentId].removeAllListeners();
			}

			delete items[assignmentId];
		} else {
			items[assignmentId] = historyItem;
		}

		this.onChange('data');
	}


	markSeen () {
		return this.putToLink('lastViewed', new Date().getTime() / 1000)
			.then(o => this.refresh(pluck(o, 'NTIID', 'Links', 'lastViewed')))
			.then(() => this.onChange('lastViewed'));
	}
}
