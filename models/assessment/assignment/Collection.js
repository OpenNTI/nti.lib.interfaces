/**
 * This MIGHT be one of the more confusing constructs in the app.
 *
 * We assume all assessments are assignments UNLESS they appear in the
 * non-assignment assessment object.  We also have a reference to all the
 * assignments that we can currently see.
 */

import Base from '../../Base';
import PageSource from '../../ListBackedPageSource';
import {
	Parser as parse
} from '../../../CommonSymbols';

import {HISTORY_LINK} from '../Constants';

import ActivityMixin from './AssignmentActivityMixin';

const ORDER_BY_COMPLETION = Symbol('ORDER_BY_COMPLETION');
const ORDER_BY_DUE_DATE = Symbol('ORDER_BY_DUE_DATE');
const ORDER_BY_LESSON = Symbol('ORDER_BY_LESSON');

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

const omit = a => a.isNonSubmit && a.isNonSubmit() && a.title === 'Final Grade';

const toNumeric = o => o ? o.getTime() : 0;
const normalize = o => o === 0 ? 0 : o / Math.abs(o);

const GetListFrom = Symbol();

export default class Collection extends Base {

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
		super(service, parent, void 0, ActivityMixin, {
			Links: [
				{rel: HISTORY_LINK, href: historyLink}
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

		let a =	this.visibleAssignments = {};
		consume(a, assignments);

		let b = this.notAssignments = {};
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
						console.warn('Duplicated key!', assessmentToOutlineMap[assessmentId], nodeId);
					}
					assessmentToOutlineMap[assessmentId] = nodeId;

					//For some reason, we sometimes get QuestionSet/Question IDs
					//here that belong to Assignments instead of the Assignment IDs...
					//So, we have to make sure the Assignment ID is in these lists and are mapped.
					let assignment = find(this.getAssignments() || [], assessmentId);
					if (assignment && assignment.getID() !== assessmentId) {
						console.warn('Part of an assignment was given as the assignment, patching: "%s"', assessmentId);
						assessmentToOutlineMap[assignment.getID()] = nodeId;
						outlineMap[nodeId].push(assignment.getID());
					}
				}
			}
		}

		Object.assign(this, {outlineMap, assessmentToOutlineMap});
	}


	onChange () {}


	sortComparatorDueDate (a, b) { //eslint-disable-line
		let aD = toNumeric(a.getDueDate());
		let bD = toNumeric(b.getDueDate());
		return normalize(aD - bD);
	}


	sortComparatorTitle (a, b) {
		return (a.title || '').localeCompare(b.title);
	}


	sortComparatorComplete (a, b) {
		const v = o => o.hasLink(HISTORY_LINK) ? 1 : -1;
		return v(a) - v(b);
	}


	[ORDER_BY_COMPLETION] (filter) {
		//The return value of getAssignments is volatile, and can be manipulated without worry.
		const all = this.getAssignments()
			//pre-sort by title so when we group, they'll already be in order with in the groups.
			.sort(this.sortComparatorTitle);

		const groups = [
			{label: 'Incomplete', items: []},
			{label: 'Complete', items: []}
		];

		let [incomplete, complete] = groups;

		for (let assignment of all) {
			let group = (assignment.hasLink(HISTORY_LINK)) ? complete : incomplete;
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
			.sort(this.sortComparatorTitle);

		let groups = {};

		const getGroup = a => {
			let due = a.getDueDate();
			let key = (new Date(due)).setHours(0, 0, 0);
			let sortBy = new Date(key);

			groups[key] = groups[key] || {
				sortBy,
				label: due == null ? '' : sortBy,
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
		} = this;

		let ungrouped = Object.assign({}, assignments);

		let groups = {};

		function getGroup (node, sortBy, key) {
			groups[key] = groups[key] || {
				label: (node || {}).label || 'Unknown',
				sortBy,
				items: []
			};

			return groups[key];
		}

		function bin (assignmentId, order, node) {
			let binId = (node && node.getID()) || 'Unknown';
			let assignment = assignments[assignmentId];

			delete ungrouped[assignmentId];

			if (assignment && !omit(assignment) && (!filter || filter(assignment))) {
				let group = getGroup(node, order, binId);
				group.items.push(assignment);
			}
		}


		const ungroupedByName = (a, b) =>
			this.sortComparatorTitle(ungrouped[a], ungrouped[b]);


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
				});

				//show the ungrouped (the inner-bin order is lost here...resort by name)
				for (let assignmentId of Object.keys(ungrouped).sort(ungroupedByName)) {
					bin(assignmentId, Number.MAX_VALUE);
				}

				return Object.values(groups).sort((a, b) => a.sortBy - b.sortBy);
			});
	}


	/**
	 * Returns assignments grouped by a particular ordering.
	 *
	 * @param {enum}   order   One of the ORDER_BY_* static constants on this class.
	 * @param {string} search  A search filter string
	 *
	 * @return {Promise} A promise that will fulfill with the collection ordered by the requested type.
	 */
	getAssignmentsBy (order, search) {
		const searchFn = a => (a.title || '').toLowerCase().indexOf(search.toLowerCase()) >= 0;
		const flatten = groups => groups.reduce((a, g) => a.concat(g.items), []);

		try {
			return Promise.resolve(this[order](search && searchFn))
				.then(items => ({ items, pageSource: new PageSource(flatten(items)) }));
		} catch (e) {
			return Promise.reject('Bad Arguments');
		}
	}



	getAssessmentIdsUnder (outlineNodeId) {
		return this.outlineMap[outlineNodeId];
	}


	getOutlineNodeIdForAssessment (thing) {
		const assessmentId = typeof thing === 'string' ? thing : thing.getID();
		return this.assessmentToOutlineMap[assessmentId];
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
		return this[GetListFrom](this.visibleAssignments, outlineNodeId);
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
		return this[GetListFrom](this.notAssignments, outlineNodeId);
	}


	getAssignment (assessmentId) {
		const {visibleAssignments: {items: map = {}}} = this;
		const findIt = x => find(Object.values(map), x);

		return map[assessmentId] || findIt(assessmentId);
	}


	isAssignment (assessmentId) {
		if(this.getAssignment(assessmentId)) {
			return true;
		}

		let maybe = this.getAssessments();
		return !maybe || !find(maybe, assessmentId);
	}
}

Object.assign(Collection.prototype, {
	ORDER_BY_COMPLETION,
	ORDER_BY_DUE_DATE,
	ORDER_BY_LESSON
});
