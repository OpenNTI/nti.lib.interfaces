import Base from '../Base';

import moment from 'moment';

import browser from '../../utils/browser';

const SOURCE = 'source';
const ACTIVE_REQUEST = Symbol('active');
const ADD_ITEM_TO_BIN = Symbol('protected method: addToBin');
const BINS = Symbol();

const getWeek = (date, side = 'end') => moment(date)[`${side}Of`]('isoWeek').toDate();
const getWeekAsTimestamp = (date, side = 'end') => Math.round(getWeek(date, side).getTime() / 1000);

class Bucket extends Array {
	constructor (start, end) {
		super();
		Object.assign(this, {start, end});
	}
}

export default class BucketedActivityStream extends Base {

	constructor (service, course, href, outline, assignments) {
		super(service, course, { Links: [ { rel: SOURCE, href } ] });

		this[BINS] = [];

		const start = Date.now();
		const weekOf = getWeekAsTimestamp();

		if (browser) {
			this.on('load', (_, time) => console.log('Load: %s %o', time, this));
		}

		this[ACTIVE_REQUEST] = Promise.all([
			//allow outline and assignments to be anything...
			Promise.resolve(outline).catch(()=> null),
			Promise.resolve(assignments).catch(()=> null),
			this.fetchLinkParsed(SOURCE, { MostRecent: weekOf })
		])
			.then(data => this.buildBins(...data))
			.then(()=> delete this[ACTIVE_REQUEST])
			.then(()=> {
				const loaded = Date.now();
				this.emit('load', this, `${(loaded - start)}ms`);
				this.emit('change', this);
			});
	}


	[Symbol.iterator] () {
		let snapshot = this[BINS].filter(x => x.start > this.lastLoadedPage);
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


	get loading () {
		return !!this[ACTIVE_REQUEST];
	}


	[ADD_ITEM_TO_BIN] (item, dateToConsider) {
		const {[BINS]: bins} = this;
		const today = new Date();
		const date = dateToConsider > today ? today : dateToConsider;
		const start = getWeek(date, 'start');
		const end = getWeek(date, 'end');


		let bin = bins.find(x => x.start.getTime() === start.getTime());
		if (!bin) {
			bin = new Bucket(start, end);
			const insertBeforeIndex = bins.findIndex(x => x.start < start);
			if (insertBeforeIndex > -1) {
				bins.splice(insertBeforeIndex, 0, bin);
			} else {
				bins.push(bin);
			}
		}

		bin.push(item);
	}


	buildBins (outline, assignmentsCollection, initialActivity) {
		const thisWeek = getWeek();

		this.lastLoadedPage = getWeek(initialActivity.getOldestDate(), 'start');

		const relevantLeasons = outline.getFlattenedList()
								.filter(o => 'AvailableBeginning' in o && o.getAvailableBeginning() < thisWeek);

		const openAssignments = assignmentsCollection.getAssignments()
								.filter(a => !a.getAssignedDate() || (a.getAssignedDate() < thisWeek));

		for (let leason of relevantLeasons) {
			this[ADD_ITEM_TO_BIN](leason, leason.getAvailableBeginning());
		}

		for (let assignment of openAssignments) {
			this[ADD_ITEM_TO_BIN](assignment, assignment.getDueDate() || thisWeek);
		}

		for (let item of initialActivity) {
			this[ADD_ITEM_TO_BIN](item, item.getLastModified());
		}
	}
}
