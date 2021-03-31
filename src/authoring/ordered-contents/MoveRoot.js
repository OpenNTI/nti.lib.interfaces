import { Service } from '../../constants.js';

import OrderedContents from './WrapperUtil.js';

const ONMOVE = Symbol('on-move');

function getIdForMove(obj) {
	return obj.NTIID ? obj.NTIID : obj;
}

export default class MoveRoot {
	constructor(containerModel, moveRel) {
		this.backingObj = containerModel;
		this[Service] = containerModel[Service];
		this.moveLink = containerModel.getLink(moveRel);
	}

	get canMove() {
		return !!this.moveLink;
	}

	/**
	 * Move a record from one parent to another at an index
	 *
	 * @param  {Object|string} record         the record or NTIID to move
	 * @param  {number} index          the index to move to
	 * @param  {number} originalIndex  the index to move from
	 * @param  {Object|string} newParent      the record or NTIID to move to
	 * @param  {Object|string} originalParent the record or NTIID to move from
	 * @returns {Promise}                fulfills with the record that was moved
	 */
	moveRecord(record, index, originalIndex, newParent, originalParent) {
		const link = this.moveLink;
		let move;

		let data = {
			ObjectNTIID: getIdForMove(record),
			ParentNTIID: getIdForMove(newParent),
			OldParentNTIID: getIdForMove(originalParent),
		};

		index = index || 0;

		if (index < Infinity) {
			data.Index = index;
		}

		if (!link) {
			move = Promise.reject('No move link');
		} else if (!newParent) {
			move = Promise.reject('No new parent to move to');
		} else if (!originalParent) {
			move = Promise.reject('No old parent to move from');
		} else if (
			data.ParentNTIID === data.OldParentNTIID &&
			index === originalIndex
		) {
			move = Promise.resolve(record);
		} else {
			move = this[Service].post(link, data).then(resp => {
				return this[ONMOVE](record, newParent, originalParent, resp);
			});
		}

		return move;
	}

	[ONMOVE](record, newParent, originalParent) {
		if (originalParent.refresh) {
			originalParent.refresh();
		}

		let update;

		if (newParent.refresh) {
			update = newParent.refresh();
		} else {
			//TODO: fill out this case if we ever hit it
			update = Promise.reslove();
		}

		return update.then(parent => {
			if (!parent) {
				return record;
			}

			let orderedContents = new OrderedContents(parent);

			return orderedContents.findItem(record);
		});
	}
}
