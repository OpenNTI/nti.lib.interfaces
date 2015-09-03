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


function nodeToNTIIDs (node) {
	let id = node.get('ntiid');
	return (id ? [id] : []).concat(
			node.children.reduce((a, b) =>
				a.concat(nodeToNTIIDs(b)), []));
}


const toNumeric = o => o ? o.getTime() : 0;
const normalize = o => o === 0 ? 0 : o / Math.abs(o);


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
	 * @param  {array} tables                Tables of Contents
	 * @returns {void}
	 */
	constructor (service, parent, assignments, assessments, tables) {
		super(service, parent);

		const process = (k, v, o) => o[k] = Array.isArray(v) ? this[parse](v) : v;
		const consume = (obj, dict) => Object.keys(dict)
											.filter(x => x !== 'href')
											.forEach(key => process(key, dict[key], obj));

		this.tables = tables;

		let a =	this.visibleAssignments = {};
		consume(a, assignments);

		let b = this.notAssignments = {};
		consume(b, assessments);
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
			let key = (new Date(a.getDueDate())).setHours(0, 0, 0);
			groups[key] = groups[key] || {label: new Date(key), items: []};
			return groups[key];
		};

		for (let assignment of all) {
			if (!filter || filter(assignment)) {
				let group = getGroup(assignment);
				group.items.push(assignment);
			}
		}

		return Object.values(groups).sort((a, b) => a.label - b.label);
	}


	[ORDER_BY_LESSON] () {}


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


	/**
	 * Get the known visible assignments for the current user. If the outlineNodeID is
	 * ommitted then ALL the assignments are returned.
	 *
	 * @param {string} outlineNodeID Optional. The outlineNode NTIID you wish to scope to.
	 *
	 * @return {array} An array of Assignments.
	 */
	getAssignments (outlineNodeID) {
		let v = this.visibleAssignments;
		let node = outlineNodeID && this.tables.getNode(outlineNodeID);
		let nodeIdsToInclude = node ? nodeToNTIIDs(node) : Object.keys(v);

		return nodeIdsToInclude.reduce((agg, id) =>
			v[id] ? agg.concat(v[id]) : agg, []);
	}


	getAssessments (outlineNodeID) {
		let v = this.notAssignments;
		let node = this.tables.getNode(outlineNodeID);
		return nodeToNTIIDs(node).reduce((agg, id) =>
			v[id] ? (agg || []).concat(v[id]) : agg, null);
	}


	isAssignment (outlineNodeID, assessmentId) {
		let maybe = this.getAssignment(outlineNodeID, assessmentId);
		if (maybe) {
			return null;
		}

		maybe = this.getAssessments(outlineNodeID, assessmentId);
		return !maybe || !find(maybe, assessmentId);
	}


	getAssignment (outlineNodeID, assignmentId) {
		let maybe = this.getAssignments(outlineNodeID);
		return maybe && find(maybe, assignmentId);
	}
}

Object.assign(Collection, {
	ORDER_BY_COMPLETION,
	ORDER_BY_DUE_DATE,
	ORDER_BY_LESSON
});
