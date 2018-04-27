/**
 * This MIGHT be one of the more confusing constructs in the app.
 *
 * We assume all assessments are assignments UNLESS they appear in the
 * non-assignment assessment object.  We also have a reference to all the
 * assignments that we can currently see.
 */
import Logger from '@nti/util-logger';
import {mixin} from '@nti/lib-decorators';

import {ASSESSMENT_HISTORY_LINK, Parser as parse, Service, Parent} from '../../../constants';
import Base from '../../Base';
import {initPrivate, getPrivate} from '../../../utils/private';

import AssignmentsByX from './AssignmentsByX';
import ActivityMixin from './AssignmentActivityMixin';


const logger = Logger.get('assignment:Collection:Base');

const ORDER_BY_COMPLETION = Symbol('ORDER_BY_COMPLETION');
const ORDER_BY_DUE_DATE = Symbol('ORDER_BY_DUE_DATE');
const ORDER_BY_LESSON = Symbol('ORDER_BY_LESSON');

function exposeOrderBySymbols (Collection) {
	Object.assign(Collection.prototype, {
		ORDER_BY_COMPLETION,
		ORDER_BY_DUE_DATE,
		ORDER_BY_LESSON
	});
}

function find (list, id) {
	return list.reduce((found, item) =>
		found || (
			(item.getID() === id || (item.containsId && item.containsId(id))) ? item : null
		), null);
}

function fillMaps (oValue, o, oKey) {
	let items = o.items = (o.items || {});
	let update = (v, old) => oValue[oValue.indexOf(old)] = v;

	if (!Array.isArray(oValue)) {
		oValue = [oValue];
		update = v => o[oKey] = v;
	}

	for (let i of oValue) {
		let key = i.getID();

		if (items[key]) {
			update(items[key], i);
			continue;
		}

		items[key] = i;
	}
}

const isFinalGrade = a => a.isNonSubmit && a.isNonSubmit() && a.title === 'Final Grade';
const omit = a => isFinalGrade(a);

const toNumeric = o => o ? o.getTime() : 0;
const normalize = o => o === 0 ? 0 : o / Math.abs(o);

const sortComparatorDueDate = (a, b) => (
	a = toNumeric(a.getDueDate()),
	b = toNumeric(b.getDueDate()),
	normalize(a - b));


const sortComparatorTitle = (a, b) => (a.title || '').localeCompare(b.title);


const GetListFrom = Symbol();

export default
@mixin(ActivityMixin)
@exposeOrderBySymbols
class Collection extends Base {

	/**
	 * Build the Assessment Collection.
	 *
	 * @param  {ServiceDocument} service     Service descriptor/interface.
	 * @param  {Model} parent                Parent model.
	 * @param  {object} assignments          Object of keys where each key is an
	 *                                       array of Assignments that are visible
	 *                                       to the current user.
	 * @param  {object} assessments          Object of keys where each key is an
	 *                                       array of Non-Assignment assessments
	 *                                       visible to the current user.
	 * @param  {string} historyLink          URL to fetch assignment histories.
	 * @returns {void}
	 */
	constructor (service, parent, assignments, assessments, historyLink) {
		super(service, parent, {
			Links: [
				{rel: ASSESSMENT_HISTORY_LINK, href: historyLink}
			]
		});

		this.onChange = this.onChange.bind(this);

		const parseItem = (o) => {
			const i = Array.isArray(o) ? o : [o];

			for (let ix = i.length - 1; ix >= 0; ix--) {
				let item = i[ix] = this[parse](i[ix]);
				if(item) {
					if (this.onChange) {
						item.on('change', this.onChange);
					}
				}
			}

			return Array.isArray(o) ? i : i[0];
		};
		const process = (k, v, o) => fillMaps(o[k] = parseItem(v), o, k);
		const getItems = o => o.Items || o;
		const isIgnoredKey = RegExp.prototype.test.bind(/^href$/i);
		const consume = (obj, dict) => Object.keys(getItems(dict))
			.filter(x => !isIgnoredKey(x))
			.forEach(key => process(key, getItems(dict)[key], obj));

		const data = {};
		initPrivate(this, data);

		let a =	data.visibleAssignments = {};
		consume(a, assignments);

		let b = data.notAssignments = {};
		consume(b, assessments);

		let outlineMap = {};
		let assessmentToOutlineMap = {};
		for (let collection of [assignments, assessments]) {
			let {Outline: map = {}} = collection;
			//The map is OutlineNodeID => [AssessmentIDs]
			//We want the map to be complete from both assessment collections.
			//Maintain the order, of the individual types, but because these
			//are split by assignments/non-assignments, there will be an
			//implicit strata. Assignments, then Self-Assessments.
			//This will not likely be exposed, so I'm not going to stress it.
			for (let nodeId of Object.keys(map)) {
				let list = outlineMap[nodeId] || [];
				//concat the two lists: (the existing and current collection's map)
				outlineMap[nodeId] = [...list, ...map[nodeId]];

				for (let assessmentId of map[nodeId]) {
					if (assessmentToOutlineMap[assessmentId]) {
						logger.debug('Duplicated key! (assessment referenced on multiple outlines?)\n\tassessmentId: %s\n\t\tnodeId (old): %s\n\t\tnodeId (new): %s',
							assessmentId,
							assessmentToOutlineMap[assessmentId],
							nodeId);
					} else {
						logger.debug('New key:\n\tassessmentId: %s\n\t\tmappted to nodeId (new): %s',
							assessmentId,
							nodeId);
					}
					assessmentToOutlineMap[assessmentId] = nodeId;

					//For some reason, we sometimes get QuestionSet/Question IDs
					//here that belong to Assignments instead of the Assignment IDs...
					//So, we have to make sure the Assignment ID is in these lists and are mapped.
					let assignment = find(this.getAssignments() || [], assessmentId);
					if (assignment && assignment.getID() !== assessmentId) {
						logger.warn('Part of an assignment was given as the assignment,\n\tpatching:\n\t\t%s\n\tto:\n\t\t%s', assessmentId, assignment.getID());
						assessmentToOutlineMap[assignment.getID()] = nodeId;
						outlineMap[nodeId].push(assignment.getID());
					}
				}
			}
		}

		Object.assign(data, {outlineMap, assessmentToOutlineMap});

		data.viewStore = new AssignmentsByX (this, ORDER_BY_LESSON);
	}


	onChange () {}


	getGroupedStore () {
		return getPrivate(this).viewStore;
	}


	[ORDER_BY_COMPLETION] (filter) {
		//The return value of getAssignments is volatile, and can be manipulated without worry.
		const all = this.getAssignments()
			//pre-sort by title so when we group, they'll already be in order with in the groups.
			.sort(sortComparatorTitle);

		const groups = [
			{label: 'Incomplete', items: []},
			{label: 'Complete', items: []}
		];

		let [incomplete, complete] = groups;

		for (let assignment of all) {
			let group = (assignment.hasLink(ASSESSMENT_HISTORY_LINK)) ? complete : incomplete;
			if (!filter || filter(assignment)) {
				group.items.push(assignment);
			}
		}

		return groups;
	}


	[ORDER_BY_DUE_DATE] (filter) {
		//The return value of getAssignments is volatile, and can be manipulated without worry.
		const all = this.getAssignments()
			//pre-sort by title so when we group, they'll already be in order with in the groups.
			.sort(sortComparatorTitle);

		let groups = {};

		const getGroup = a => {
			let due = a.getDueDate();
			let key = !due ? 'no-due-date' : (new Date(due)).setHours(0, 0, 0);
			let sortBy = due ? new Date(key) : Number.MAX_VALUE;

			groups[key] = groups[key] || {
				sortBy,
				label: due == null ? key : sortBy,
				items: []
			};

			return groups[key];
		};

		for (let assignment of all) {
			if (!filter || filter(assignment)) {
				let group = getGroup(assignment);
				group.items.push(assignment);
			}
		}

		return Object.values(groups).sort((a, b) => a.sortBy - b.sortBy);
	}


	[ORDER_BY_LESSON] (filter) {
		const {
			outlineMap,
			visibleAssignments: {items: assignments}
		} = getPrivate(this);

		let ungrouped = Object.assign({}, assignments);

		let groups = {};

		const getBinId = node => (node && node.getContentId()) || 'Unknown';

		function getGroup (node, sortBy, key) {
			groups[key] = groups[key] || {
				label: (node || {}).label || 'Unknown',
				sortBy,
				items: []
			};

			return groups[key];
		}

		function bin (assignmentId, order, node) {
			let binId = getBinId(node);
			let assignment = assignments[assignmentId];

			delete ungrouped[assignmentId];

			if (assignment && !omit(assignment) && (!filter || filter(assignment))) {
				let group = getGroup(node, order, binId);
				group.items.push(assignment);
			}
		}


		const ungroupedByName = (a, b) =>
			sortComparatorTitle(ungrouped[a], ungrouped[b]);


		return this.parent().getOutline()
			.then(outline => outline.getFlattenedList())
			.then(list => list.filter(x => x.getContentId()))
			.then(list => {

				list.forEach((n, index) => {

					let assessments = outlineMap[n.getContentId()];
					if (!assessments) { return; }

					for (let assessmentId of assessments) {
						bin(assessmentId, index, n);
					}

					const binId = getBinId(n);
					if (groups[binId]) {
						groups[binId].items
							.sort(sortComparatorDueDate);
					}
				});

				//show the ungrouped (the inner-bin order is lost here...resort by name)
				for (let assignmentId of Object.keys(ungrouped).sort(ungroupedByName)) {
					bin(assignmentId, Number.MAX_VALUE);
				}

				return Object.values(groups).sort((a, b) => a.sortBy - b.sortBy);
			});
	}


	/**
	 * Returns filtered assignments grouped by a particular ordering.
	 *
	 * @param {enum}   order   One of the ORDER_BY_* static constants on this class.
	 * @param {string} search  A search filter string
	 *
	 * @returns {Promise} fulfills with an object with key: groups, order, and search
	 */
	getAssignmentsBy (order, search) {
		const searchFn = a => (a.title || '').toLowerCase().indexOf(search.toLowerCase()) >= 0;

		try {
			const work = Promise.resolve(this[order](search && searchFn))
				.then(groups => ({ order, search, groups }));

			// the AssignmentsByX store listens for our new-filter event.
			this.emit('new-filter', work, order, search);

			return work;

		} catch (e) {
			throw new Error('Bad Arguments');
		}
	}



	getAssessmentIdsUnder (outlineNodeId) {
		return getPrivate(this).outlineMap[outlineNodeId];
	}


	getOutlineNodeIdForAssessment (thing) {
		const assessmentId = typeof thing === 'string' ? thing : thing.getID();
		return getPrivate(this).assessmentToOutlineMap[assessmentId];
	}


	[GetListFrom] (dict, outlineNodeId) {
		let {items} = dict;
		let ids = outlineNodeId && (this.getAssessmentIdsUnder(outlineNodeId) || []);
		let nodeIdsToInclude = ids || Object.keys(items || {});

		return nodeIdsToInclude
			.reduce((agg, id) => items[id] ? agg.concat(items[id]) : agg, [])
			.filter(a => !omit(a));
	}


	/**
	 * Get the known visible assignments for the current user. If the outlineNodeId is
	 * ommitted then ALL the assignments are returned.
	 *
	 * @param {string} outlineNodeId Optional. The outlineNode NTIID you wish to scope to.
	 *
	 * @return {array} An array of Assignments.
	 */
	getAssignments (outlineNodeId) {
		return this[GetListFrom](getPrivate(this).visibleAssignments, outlineNodeId);
	}


	/**
	 * Get the known visible assessments for the current user. If the outlineNodeId is
	 * ommitted then ALL the assessments are returned.
	 *
	 * @param {string} outlineNodeId Optional. The outlineNode NTIID you wish to scope to.
	 *
	 * @return {array} An array of Assessments.
	 */
	getAssessments (outlineNodeId) {
		return this[GetListFrom](getPrivate(this).notAssignments, outlineNodeId);
	}


	getAssessment (assessmentId) {
		const maybe = this.getAssessments();

		return maybe && find(maybe, assessmentId);
	}


	getAssignment (assessmentId) {
		const {visibleAssignments: {items: map = {}}} = getPrivate(this);
		const findIt = x => find(Object.values(map), x);

		return map[assessmentId] || findIt(assessmentId);
	}


	async fetchAssignment (id) {
		let assignment = this.getAssignment(id);

		const raw = await this[Service].getObjectRaw(id, null, null, {course: this[Parent].getID()});

		if (assignment) {
			await assignment.refresh(raw);
		} else {
			assignment = await this[Service].getObject(raw, {parent: this});
		}

		if (!assignment.isAssignment) {
			throw new Error('No Assignment Found');
		}

		return assignment;
	}


	isAssignment (assessmentId) {
		if(this.getAssignment(assessmentId)) {
			return true;
		}

		let maybe = this.getAssessments();
		return !maybe || !find(maybe, assessmentId);
	}


	getFinalGradeAssignmentId () {
		const {visibleAssignments: {items}} = getPrivate(this);
		const assignments = Object.values(items);
		const finalGrade = assignments.find(a => isFinalGrade(a));

		return finalGrade ? finalGrade.getID() : void 0;
	}
}
