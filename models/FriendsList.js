import Entity from './Entity';
import {Parser as parse} from '../CommonSymbols';

import pluck from '../utils/pluck';

const getID = e => typeof e === 'object' ? e.getID() : e;

export default class FriendsList extends Entity {
	constructor (service, parent, data) {
		super(service, parent, data);
		this[parse]('friends');
	}


	get length () {
		return (this.friends || []).length;
	}


	[Symbol.iterator] () {
		let snapshot = this.friends;
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


	/**
	 * Determins if the entity is in this List.
	 *
	 * @param {string|Entity} entity The User entity, string or Model Instance.
	 *
	 * @return {boolean} true if the entity is in this list.
	 */
	contains (entity) {
		let entityId = getID(entity);
		let {friends = []} = this;

		for (let e of friends) {
			if (e.getID() === entityId) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Add a new entity to the list.
	 *
	 * @param {string|Entity} entity The entity to add.
	 * @return {Promise} To fulfill if successfull, or reject with an error.
	 */
	add (entity) {
		let entityId = getID(entity);

		if (!this.hasLink('edit')) {
			return Promise.reject('No Edit Link');
		}

		let {friends = []} = this;

		let index = friends.findIndex(x => x.getID() === entityId);
		if (index >= 0) {
			return Promise.resolve(this);
		}

		let data = this.getData();

		data.friends = [...friends.map(x => getID(x)), entityId];

		return this.putToLink('edit', data)
			.then(o => this.refresh(pluck(o, 'NTIID', 'friends')))
			.then(() => this.onChange('friends'))
			.then(() => this);//always fulfill with 'this' (don't leak new/raw instances)
	}


	/**
	 * Remove an entity from the list.
	 *
	 * @param {string|Entity} entity The entity to be removed.
	 *
	 * @return {Promise} To fulfill if successfull, or reject with an error.
	 */
	remove (entity) {
		let entityId = getID(entity);

		if (!this.hasLink('edit')) {
			return Promise.reject('No Edit Link');
		}

		let {friends = []} = this;

		let index = friends.findIndex(x => x.getID() === entityId);

		if (index < 0) {
			return Promise.resolve(this);
		}

		let item = this.friends.splice(index, 1)[0]; //delete the item from the list.

		//Lets just submit the username/id of the entities in our list instead of the full objects.
		let data = this.getData();
		data.friends = data.friends.map(x => getID(x));

		return this.putToLink('edit', data)
			.then(() => this.onChange('friends'))
			.then(() => this)//always fulfill with 'this' (don't leak new/raw instances)
			.catch(e => {
				this.friends.splice(index, 0, item); // put the item back.

				//continue the failure.
				return Promise.reject(e);
			});
	}


	getID () { return this.ID; }
}
