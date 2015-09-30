import Base from '../Base';

import moment from 'moment';

const SOURCE = 'source';
const ACTIVE_REQUEST = Symbol('active');

const getWeek = (date) => Math.round(moment.utc(date).endOf('isoWeek').toDate().getTime() / 1000);

export default class BucketedActivityStream extends Base {

	constructor (service, course, href, outline, assignments) {
		super(service, course, { Links: [ { rel: SOURCE, href } ] });

		this[ACTIVE_REQUEST] = Promise.all([
			//allow outline and assignments to be anything...
			Promise.resolve(outline).catch(()=> null),
			Promise.resolve(assignments).catch(()=> null),
			this.fetchLinkParsed(SOURCE, { MostRecent: getWeek() })
		])
			.then(data => {
				console.log(data);
			});
	}

	map () {}
}
