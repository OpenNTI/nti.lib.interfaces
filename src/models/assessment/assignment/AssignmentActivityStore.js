import Logger from '@nti/util-logger';

import { Parent, Service, NO_LINK } from '../../../constants.js';
import getLink from '../../../utils/get-link.js';
import Stream from '../../../stores/Stream.js';
import { getPrivate } from '../../../utils/private.js';

const logger = Logger.get('assignment:activity');

const EVENT_MAP = {
	'application/vnd.nextthought.assessment.userscourseassignmenthistoryitemfeedback':
		'buildFeedbackEvent',
	'application/vnd.nextthought.assessment.assignmentsubmission':
		'buildSubmissionEvents',
};

export default class AssignmentActivityStore extends Stream {
	constructor(service, owner, href, staticActivityFactory) {
		super(service, owner, href, { batchSize: 20, batchStart: 0 });
		getPrivate(this).getStaticActivity = staticActivityFactory;
	}

	async markSeen() {
		const link = getPrivate(this).lastViewed;
		if (!link) {
			throw new Error(NO_LINK);
		}

		const newViewed = new Date();

		return this[Service].put(link, newViewed.getTime() / 1000).then(
			() => (
				(this.lastViewed = newViewed), this.emit('change', 'lastViewed')
			)
		);
	}

	applyBatch(data) {
		super.applyBatch(data);
		const p = getPrivate(this);

		p.lastViewed = getLink(data, 'lastViewed');
		this.lastViewed = Date(data.lastViewed * 1000);

		if (p.getStaticActivity && !this.more) {
			let staticEvents = p.getStaticActivity(this.lastViewed);
			delete p.getStaticActivity;

			p.data = staticEvents.concat(p.data || []);
			p.needsSort = true;
		}
	}

	parseList(items) {
		const list = super.parseList(items);
		const result = [];
		//Derive!!!
		for (let item of list) {
			const fn = EVENT_MAP[item.MimeType];
			if (!fn) {
				logger.warn('No mapping for %s %o', item.MimeType, item);
				continue;
			}

			let o = this[Parent][fn](item, this.lastViewed);
			if (!Array.isArray(o)) {
				o = [o];
			}

			result.push(...o);
		}

		if (result.length) {
			getPrivate(this).needsSort = true;
		}
		return result;
	}

	get items() {
		const p = getPrivate(this);
		if (p.needsSort) {
			delete p.needsSort;
			p.data.sort((a, b) => a.date - b.date);
		}

		const i = super.items.slice();
		i.reverse();
		return i;
	}
}
