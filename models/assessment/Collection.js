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
