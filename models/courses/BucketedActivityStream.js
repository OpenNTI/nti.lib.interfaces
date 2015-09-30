import Base from '../Base';

import moment from 'moment';

const SOURCE = 'source';
const ACTIVE_REQUEST = Symbol('active');

const getWeek = (date, side = 'end') => Math.round(moment.utc(date)[`${side}Of`]('isoWeek').toDate().getTime() / 1000);

export default class BucketedActivityStream extends Base {

	constructor (service, course, href, outline, assignments) {
		super(service, course, { Links: [ { rel: SOURCE, href } ] });

		const weekOf = getWeek();

		this[ACTIVE_REQUEST] = Promise.all([
			//allow outline and assignments to be anything...
			Promise.resolve(outline).catch(()=> null),
			Promise.resolve(assignments).catch(()=> null),
			this.fetchLinkParsed(SOURCE, { MostRecent: weekOf })
		])
			.then(data => this.buildBins(...data));
	}


	buildBins (outline, assignmentsCollection, initialActivity) {
		const date = initialActivity.getMostRecentDate();
		const today = new Date();
		const firstWeek = [ getWeek(date, 'start'), getWeek(date, 'end') ];
		const datedLessons = outline.getFlattenedList().filter(o => 'AvailableBeginning' in o && o.getAvailableBeginning() < today);
		const assignmentList = assignmentsCollection.getAssignments();

		console.debug(firstWeek, datedLessons, assignmentList);
	}


	map () {}
}
