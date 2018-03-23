import {Proxy as ProxyObject} from 'nti-commons';
import Logger from 'nti-util-logger';
import startOfISOWeek from 'date-fns/start_of_iso_week';
import endOfISOWeek from 'date-fns/end_of_iso_week';

import Base from '../Base';


const SOURCE = 'source';
const ACTIVE_REQUEST = Symbol('active');
const ADD_ITEM_TO_BIN = Symbol('protected method: addItemToBin');
const APPLY_ACTIVITY = Symbol('protected method: applyActivity');
const BUILD_BINS = Symbol('protected method: buildBins');
const BINS = Symbol();


const dateFns = {
	end: endOfISOWeek,
	start: startOfISOWeek,
};

const getWeek = (date, side = 'end') => dateFns[side](date);
const dateToTimestamp = date => Math.round(date.getTime() / 1000);
const getWeekAsTimestamp = (date, side = 'end') => dateToTimestamp(getWeek(date, side));

const logger = Logger.get('models:courses:BucketedActivityStream');

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

		if (process.browser) {
			this.on('load', (_, time) => logger.log('Load: %s %o', time, this));
		}

		this[ACTIVE_REQUEST] = Promise.all([
			//allow outline and assignments to be anything...
			Promise.resolve(outline).catch(()=> null),
			Promise.resolve(assignments).catch(()=> null),
			this.fetchLinkParsed(SOURCE, { MostRecent: weekOf })
		])
			.then(data => this[BUILD_BINS](...data))
			.then(()=> delete this[ACTIVE_REQUEST])
			.then(()=> {
				const loaded = Date.now();
				this.emit('load', this, `${(loaded - start)}ms`);
				this.emit('change', this);
			});
	}


	nextBatch () {
		const start = new Date();
		//Notice we're not returning this promise...
		Promise.resolve(this[ACTIVE_REQUEST])
			.catch(() => {}) //ignore errors from that request. (they'll be handled by its caller)
			.then(() => {
				// Because we're simply waiting for the current (if any) request to finish, we do
				// not need to chain/pend the new request to it (by returning its promise)
				this[ACTIVE_REQUEST] = this.fetchLinkParsed(SOURCE, { MostRecent: this.nextPageParam })
					.then(data => this[APPLY_ACTIVITY](data))
					.then(()=> delete this[ACTIVE_REQUEST])
					.then(()=> {
						const loaded = Date.now();
						this.emit('load', this, `${(loaded - start)}ms`);
						this.emit('change', this);
					});
			});
	}


	[Symbol.iterator] () {
		let snapshot = this[BINS].filter(x => x.start > this.bucketLimiter);
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


	[APPLY_ACTIVITY] (recursiveStreamByBucket) {
		const date = recursiveStreamByBucket.getOldestDate(); //if there isn't an oldest date, this method returns epoch.

		this.hasMore = false; //assume no more data.

		// convert the Date object to a unix-timestamp.
		this.nextPageParam = dateToTimestamp(date);

		// Limit the iteration of bins to only include the data we've loaded, if we've finished loading,
		// this should become unbounded by epoch.
		this.bucketLimiter = getWeek(date, 'start');

		for (let item of recursiveStreamByBucket) {
			//if we enter this iteration, there might be more data... so set hasMore truthy.
			this.hasMore = 'maybe';
			//Deal with the data...
			this[ADD_ITEM_TO_BIN](item, item.getLastModified());
		}
	}


	[BUILD_BINS] (outline, assignmentsCollection, initialActivity) {
		const assignmentPropertiesToProxy = [
			'MimeType',
			'isLate',
			'hasSubmission',
			'getAssignedDate',
			'getDueDate',
			'getID',
			'getQuestionCount',
			'title'
		];

		const thisWeek = getWeek();

		const relevantLessons = outline.getFlattenedList()
			.filter(o => o.isLeaf && 'AvailableBeginning' in o && o.getAvailableBeginning() < thisWeek);

		const openAssignments = assignmentsCollection.getAssignments()
			.filter(a => !a.getAssignedDate() || (a.getAssignedDate() < thisWeek));

		for (let lesson of relevantLessons) {
			this[ADD_ITEM_TO_BIN](lesson, lesson.getAvailableBeginning());
		}

		for (let assignment of openAssignments) {
			const outlineNodeId = assignmentsCollection.getOutlineNodeIdForAssessment(assignment);
			const outlineNode = outlineNodeId && outline.getNode(outlineNodeId);

			const obj = new ProxyObject(assignment, assignmentPropertiesToProxy, { outlineNode });


			this[ADD_ITEM_TO_BIN](obj, assignment.getDueDate() || thisWeek);
		}

		this[APPLY_ACTIVITY](initialActivity);
	}
}
