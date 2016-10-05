import path from 'path';

import Logger from 'nti-util-logger';
import {isNTIID} from 'nti-lib-ntiids';
import minWait, {SHORT} from 'nti-commons/lib/wait-min';
import Executor from 'nti-commons/lib/Executor';

import {Service} from '../../constants';

const logger = Logger.get('lib:asssignment-editor:utils:OrderedContents');

const REPLACE_WITH = Symbol('Replace With');
const SET_ERROR = Symbol('Set Error');
const REMOVE = Symbol('Remove');

const LINK_NAME = 'ordered-contents';

const FIELDS = [
	'questions',
	'parts'
];

const QUEUES = new WeakMap();
const MAX_CONCURRENT = 1;

function defineNonEnumerableProperty (item, property, value) {
	Object.defineProperty(item, property, {
		configurable: true,//allow the property to be reconfigured (aka deleted or redefined)
		enumerable: false,//it defaults to false, just being explicit (for your benefit)
		value
	});
}

function getQueueFor (obj) {
	let queue = QUEUES.get(obj);

	if (!queue) {
		queue = new Executor(MAX_CONCURRENT);
		QUEUES.set(obj, queue);
	}

	return queue;
}


function getLinkFromObj (obj) {
	return obj && (obj.getOrderedContentsLink ?
						obj.getOrderedContentsLink() :
						obj.getLink ?
							obj.getLink(LINK_NAME) :
							''
					);
}


export function hasOrderedContents (obj) {
	const link = getLinkFromObj(obj);

	return !!link;
}


export default class OrderedContents {
	constructor (obj, service) {
		this.backingObject = obj;
		this[Service] = service || obj[Service];
	}


	updateBackingObject (obj) {
		this.backingObject = obj;
	}


	get orderedContentsField () {
		const obj = this.backingObject;

		if (obj.orderedContentsField) {
			return obj.orderedContentsField;
		}

		for (let field of FIELDS) {
			if (Array.isArray(obj[field])) {
				return field;
			}
		}
	}


	get orderedContents () {
		const {orderedContentsField} = this;

		if (!orderedContentsField) {
			return [];
		}

		return this.backingObject[orderedContentsField];
	}


	get length () {
		return this.orderedContents.length;
	}


	get link () {
		return getLinkFromObj(this.backingObject);
	}


	get canEdit () {
		return hasOrderedContents(this.backingObject);
	}


	isSameContainer (record) {
		const myId = this.backingObject.NTIID;
		const theirId = record.NTIID ? record.NTIID : record;

		return myId === theirId;
	}


	indexOf (item) {
		let {orderedContents} = this;
		let NTIID = item.NTIID ? item.NTIID : item;

		for (let i = 0; i < orderedContents.length; i++) {
			if (orderedContents[i] && orderedContents[i].NTIID === NTIID) {
				return i;
			}
		}

		return -1;
	}


	findItem (item) {
		let {orderedContents} = this;
		let NTIID = item.NTIID ? item.NTIID : item;

		for (let i = 0; i < orderedContents.length; i++) {
			if (orderedContents[i].NTIID === NTIID) {
				return orderedContents[i];
			}
		}

		return null;
	}


	optimisticallyAddAt (item, index, delaySave) {
		const obj = this.backingObject;

		let {orderedContents, orderedContentsField} = this;
		let createItem;

		const replaceItem = (placeholder, replacement) => {
			let newContents = this.orderedContents;
			const placeholderIndex = newContents.findIndex(x => x === placeholder);

			if (placeholderIndex < 0) {
				logger.error('How did we get here?!?!?!?!');
			} else if (replacement) {
				newContents[placeholderIndex] = replacement;
			} else {
				newContents.splice(placeholderIndex, 1);
			}

			obj[orderedContentsField] = newContents;
			obj.onChange();
		};

		const setErrorOn = (placeholder, error) => {
			delete placeholder.isSaving;

			//if there is an error, replace the optimistic placeholder with an error case
			defineNonEnumerableProperty(placeholder, 'isNotSaved', true);

			defineNonEnumerableProperty(placeholder, 'error', error);


			//Fire the on change
			obj.onChange();
		};

		if (!item.NTIID) {
			createItem = Promise.resolve(this[Service].getObjectPlaceholder(item));
		} else {
			defineNonEnumerableProperty(item, 'isSaving', true);

			createItem = Promise.resolve(item);
		}

		return createItem
			.then((placeholder) => {
				if (delaySave && placeholder.isPlaceholder) {
					defineNonEnumerableProperty(placeholder, 'delaySaving', true);
				}

				placeholder[REPLACE_WITH] = replacement => replaceItem(placeholder, replacement);
				placeholder[SET_ERROR] = error => setErrorOn(placeholder, error);
				placeholder[REMOVE] = () => replaceItem(placeholder);

				orderedContents = [...orderedContents.slice(0, index), placeholder, ...orderedContents.slice(index)];
				obj[orderedContentsField] = orderedContents;

				obj.onChange();

				return placeholder;
			});
	}

	/**
	 * Given an item and an index, insert it at the right place and try to save it to the server.
	 * If it's successful, replace the optimistic placeholder with the item from the server.
	 * If it fails, add an error to the optimistic placeholder and trigger a change
	 * @param  {Object} item the item to append
	 * @param {Number} index the index to insert the item at
	 * @param {Boolean} delaySave insert the placeholder, but wait to save it
	 * @return {Promise}      fulfills or rejects if the item is successfully added or not
	 */
	insertAt (item, index, delaySave) {
		const queue = getQueueFor(this.backingObject);
		const {link} = this;

		if (!link) {
			return Promise.reject('No Ordered Contents Link');
		}

		if (index === Infinity || index === undefined) {
			index = this.length;
		}

		if (index < 0) {
			index = 0;
		}

		const insertLink = path.join(link, 'index', index.toString(10));

		const getPostData = (placeholder) => {
			return isNTIID(placeholder.NTIID) ? {NTIID: placeholder.NTIID} : placeholder.getData();
		};

		const doSave = (placeholder) => {
			return queue.queueTask(() => this[Service].postParseResponse(insertLink, getPostData(placeholder)))
				//Make sure we wait at least a little bit
				.then(minWait(SHORT))
				.then((savedItem) => placeholder[REPLACE_WITH](savedItem))
				.catch((reason) => {
					placeholder[SET_ERROR](reason);

					return Promise.reject(reason);
				});
		};


		return this.optimisticallyAddAt(item, index, delaySave)
			.then((placeholder) => {
				let save;
				if (delaySave) {
					save = new Promise((fulfill, reject) => {
						placeholder.save = data => {
							return doSave({...placeholder, ...data})
								.then(response => (fulfill(), response))
								.catch(reject);
						};

						placeholder.remove = () => {
							placeholder[REMOVE]();
							fulfill();
						};
					});
				} else {
					save = doSave(placeholder);
				}

				return save;
			});
	}


	/**
	 * Given an item optimistically add it to the items, and try to save it to the server.
	 * If it's successful, replace the optimistic placeholder with the item from the server.
	 * If it fails, add an error to the optimistic placeholder and trigger a change
	 * @param  {Object} item the item to append
	 * @param {Boolean} delaySave insert the placeholder, but delay saving
	 * @return {Promise}      fulfills or rejects if the item is successfully added or not
	 */
	append (item, delaySave) {
		return this.insertAt(item, Infinity, delaySave);
	}


	/**
	 * Given an item, if its in the ordered contents mark it for deletion, and try to delete it from the server.
	 * If it's successful, remove the item from the ordered contents.
	 * If it fails, add an error to the existing item and leave it there.
	 *
	 * If the item isn't in the ordered contents there's nothing to do so just resolve
	 *
	 * @param  {Object} item the item to delete
	 * @return {Promise}     fulfills or rejects if the item is successfully deleted or not
	 */
	remove (item) {
		const obj = this.backingObject;
		let {orderedContents, orderedContentsField, link} = this;
		let index = this.indexOf(item);

		if (!link) {
			return Promise.reject('No Ordered Contents Link');
		}

		//If the item isn't in the ordered contents there's nothing to do
		if (index < 0) {
			return Promise.resolve();
		}

		item = orderedContents[index];

		//Mark Item as deleting
		defineNonEnumerableProperty(item, 'isDeleting', true);

		obj[orderedContentsField] = orderedContents;
		obj.onChange();

		let deleteRequest;

		if (!item.NTIID) {
			deleteRequest = Promise.reject('No NTIID on the item to delete');
		} else {
			let deleteLink = path.join(link, 'ntiid', item.NTIID);

			deleteRequest = this[Service].delete(deleteLink);
		}

		return deleteRequest
				.then(minWait(SHORT))
				.then(() => {
					//After its removed from the server, remove it from the ordered contents
					orderedContents = orderedContents.filter(a => a.NTIID !== item.NTIID);
					obj[orderedContentsField] = orderedContents;
					obj.onChange();

					return () => {
						this.insertAt(item, index);
					};
				})
				.catch((reason) => {
					delete item.isDeleting;

					//If the server fails, leave it in the ordered contents and mark it with an error
					defineNonEnumerableProperty(item, 'isNotDeleted', true);


					defineNonEnumerableProperty(item, 'error', reason);

					obj.onChange();

					return Promise.reject(reason);
				});

	}


	/**
	 * Given an item, try to move it to the given index
	 *
	 * If the item is already in the list, optimistically move it to the new spot and mark it as saving
	 * If the item is not already in the list, optimistically add it to the new sport and mark it as saving
	 *
	 * If there is an error saving, either move it back to the old index or remove it, and mark it with an error
	 *
	 * @param  {Object|String} item    the record or NTIID to move
	 * @param  {Number} newIndex     the index to move to
	 * @param  {Number} oldIndex  the original index
	 * @param  {Object|String} oldParent the original parent
	 * @param  {Object} moveRoot  the root to move items between
	 * @return {Promise}           fulfills or rejects if the move was successful
	 */
	move (item, newIndex, oldIndex, oldParent, moveRoot) {
		const obj = this.backingObject;
		const queue = getQueueFor(obj);

		let {orderedContents, orderedContentsField} = this;
		let currentIndex = this.indexOf(item);

		if (!moveRoot) {
			return Promise.reject('No moving root provided');
		}

		//If its in the same position in the same container there is nothing to do
		if (newIndex === currentIndex && this.isSameContainer(oldParent)) {
			return Promise.resolve();
		}

		if (currentIndex === -1 || oldIndex == null) {
			return this.insertAt(item, newIndex);
		}

		orderedContents = orderedContents.slice(0);

		if (currentIndex >= 0) {
			item = orderedContents[currentIndex];
			orderedContents.splice(currentIndex, 1);
		}

		//Mark the Item as saving
		// defineNonEnumerableProperty(item, 'isSaving', true);

		//Optimistically insert the record at the new index
		orderedContents = [...orderedContents.slice(0, newIndex), item, ...orderedContents.slice(newIndex)];

		obj[orderedContentsField] = orderedContents;
		obj.onChange();

		return queue.queueTask(() => moveRoot.moveRecord(item, newIndex, oldIndex, obj, oldParent))
			.then(minWait(SHORT))
			.then((savedItem) => {
				//update the item with the new one from the server
				obj[orderedContentsField] = orderedContents.map((orderedItem) => {
					return orderedItem.NTIID === savedItem.NTIID ? savedItem : orderedItem;
				});

				obj.onChange();
			})
			.catch((reason) => {
				// delete item.isSaving;

				defineNonEnumerableProperty(item, 'isNotSaved', true);

				defineNonEnumerableProperty(item, 'error', reason);

				if (newIndex >= 0) {
					orderedContents.splice(newIndex, 1);
				}

				//move the item back...
				orderedContents = [...orderedContents.slice(0, currentIndex), item, ...orderedContents.slice(currentIndex)];

				obj[orderedContentsField] = orderedContents;

				obj.onChange();

				//continue the failure
				return Promise.reject(reason);
			});
	}
}
