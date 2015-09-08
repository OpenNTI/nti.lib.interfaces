/**
 * This MIGHT be one of the more confusing constructs in the app.
 *
 * We assume all assessments are assignments UNLESS they appear in the
 * non-assignment assessment object.  We also have a reference to all the
 * assignments that we can currently see.
 */

import Base from '../Base';
import {
	Parser as parse
} from '../../CommonSymbols';

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
	 * @returns {void}
	 */
	constructor (service, parent, assignments, assessments) {
		super(service, parent);

		const process = (k, v, o) => fillMaps(o[k] = this[parse](v), o, k);
		const getItems = o => o.Items || o;
		const isIgnoredKey = RegExp.prototype.test.bind(/^href$/i);
		const consume = (obj, dict) => Object.keys(getItems(dict))
											.filter(x => !isIgnoredKey(x))
											.forEach(key => process(key, dict[key], obj));

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
				}
			}
		}

		Object.assign(this, {outlineMap, assessmentToOutlineMap});
	}


	sortComparatorDueDate (a, b) { //eslint-disable-line
		let aD = toNumeric(a.getDueDate());
		let bD = toNumeric(b.getDueDate());
		return normalize(aD - bD);
	}


	sortComparatorTitle (a, b) {
		return (a.title || '').localeCompare(b.title);
	}


	sortComparatorComplete (a, b) {
		const v = o => o.hasLink('History') ? 1 : -1;
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
			let group = (assignment.hasLink('History')) ? complete : incomplete;
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
			assessmentToOutlineMap: mapping,
			visibleAssignments: {items: assignments}
		} = this;
		const keys = Object.keys(assignments);

		let groups = {};

		const getGroup = (node, sortBy, key) => {
			groups[key] = groups[key] || {
				label: (node || {}).label || 'Unknown',
				sortBy,
				items: []
			};

			return groups[key];
		};



		return this.parent().getOutline()
			.then(outline => outline.getFlattenedList())
			.then(list => {
				let nodes = {}, i = 0;
				for (let node of list) {
					nodes[node.getID()] = {index: i++, node};
				}

				for (let key of keys) {
					let nodeId = mapping[key];
					let {node, index = -1} = nodes[nodeId] || {};

					let assignment = assignments[key];

					if (!filter || filter(assignment)) {
						let group = getGroup(node, index, key);
						group.items.push(assignment);
					}

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

		try {
			return Promise.resolve(this[order](search && searchFn));
		} catch (e) {
			return Promise.reject('Bad Arguments');
		}
	}



	getAssessmentIdsUnder (outlineNodeId) {
		let {outlineMap: map = {}} = this;
		return map[outlineNodeId];
	}


	[GetListFrom] (dict, outlineNodeId) {
		let {items} = dict;
		let ids = outlineNodeId && (this.getAssessmentIdsUnder(outlineNodeId) || []);
		let nodeIdsToInclude = ids || Object.keys(items);

		return nodeIdsToInclude.reduce((agg, id) =>
			items[id] ? agg.concat(items[id]) : agg, []);
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


	getAssignment (assignmentId) {
		const {visibleAssignments: {items: map}} = this;
		return map[assignmentId];
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
