import Logger from 'nti-util-logger';
import {Parent, Service} from '../../../constants';
import getLink from '../../../utils/getlink';
import Stream, {getPrivate} from '../../../stores/Stream';

const logger = Logger.get('assignment:activity');

const EVENT_MAP = {
	'application/vnd.nextthought.assessment.userscourseassignmenthistoryitemfeedback': 'buildFeedbackEvent',
	'application/vnd.nextthought.assessment.assignmentsubmission': 'buildSubmissionEvents'
};

export default class AssignmentActivityStore extends Stream {
	constructor (service, owner, href, staticActivityFactory) {
		super(service, owner, href);
		getPrivate(this).getStaticActivity = staticActivityFactory;

	}


	markSeen () {
		const link = getPrivate(this).lastViewed;
		if (!link) {
			return Promise.reject('No Link');
		}

		const newViewed = new Date();

		return this[Service].put(link, newViewed.getTime() / 1000)
			.then(() => (this.lastViewed = newViewed, this.emit('change', 'lastViewed')));
	}


	applyBatch (data) {
		super.applyBatch(data);
		const p = getPrivate(this);

		p.lastViewed = getLink(data, 'lastViewed');
		this.lastViewed = Date(data.lastViewed * 1000);

		if (p.getStaticActivity) {
			p.data = p.getStaticActivity(this.lastViewed);
			p.data.sort((a, b) => a.date - b.date);
			delete p.getStaticActivity;
		}
	}


	parseList (items) {
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

		result.sort((a, b) => a.date - b.date);
		return result;
	}


	get items () {
		const i = super.items.slice();
		i.reverse();
		return i;
	}

}
