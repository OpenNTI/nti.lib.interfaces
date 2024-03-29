import { pluck } from '@nti/lib-commons';

import Registry, { COMMON_PREFIX } from '../Registry.js';

import Entity from './Entity.js';

const getID = e => (typeof e === 'object' ? e.getID() : e);

export default class FriendsList extends Entity {
	static MimeType = COMMON_PREFIX + 'friendslist';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'friends': { type: 'model[]' },
	};

	get displayType() {
		return 'List';
	}

	get length() {
		return (this.friends || []).length;
	}

	[Symbol.iterator]() {
		let snapshot = this.friends || [];
		let { length } = snapshot;
		let index = 0;
		return {
			next() {
				let done = index >= length;
				let value = snapshot[index++];

				return { value, done };
			},
		};
	}

	/**
	 * Determines if the entity is in this List.
	 *
	 * @param {string|Entity} entity The User entity, string or Model Instance.
	 * @returns {boolean} true if the entity is in this list.
	 */
	contains(entity) {
		let entityId = getID(entity);
		let { friends = [] } = this;

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
	 * @param {...string|Entity} entities The entity to add.
	 * @returns {Promise} To fulfill if successful, or reject with an error.
	 */
	async add(...entities) {
		if (!this.isModifiable) {
			throw new Error('Model is not Modifiable');
		}

		let data = this.getData();
		let { friends = [] } = this;
		let newFriends = [];

		//unwrap argument array argument
		if (entities.length === 1 && Array.isArray(entities[0])) {
			entities = entities[0];
		}

		for (let entity of entities) {
			let entityId = getID(entity);
			let index = friends.findIndex(x => x.getID() === entityId);
			if (index >= 0) {
				continue;
			}

			newFriends.push(entityId);
		}

		if (newFriends.length === 0) {
			return Promise.resolve(this);
		}

		data.friends = [...friends.map(x => getID(x)), ...newFriends];

		return this.fetchLink({ method: 'put', mode: 'raw', rel: 'edit', data })
			.then(o => this.refresh(pluck(o, 'NTIID', 'friends')))
			.then(() => this.onChange('friends'))
			.then(() => this); //always fulfill with 'this' (don't leak new/raw instances)
	}

	/**
	 * Remove an entity from the list.
	 *
	 * @param {string|Entity} entity The entity to be removed.
	 * @returns {Promise} To fulfill if successful, or reject with an error.
	 */
	async remove(entity) {
		const entityId = getID(entity);

		if (!this.isModifiable) {
			throw new Error('Model is not Modifiable');
		}

		const { friends = [] } = this;

		const index = friends.findIndex(x => x.getID() === entityId);

		if (index < 0) {
			return Promise.resolve(this);
		}

		const item = friends.splice(index, 1)[0]; //delete the item from the list.

		//Lets just submit the username/id of the entities in our list instead of the full objects.
		const data = this.getData();
		data.friends = friends.map(x => getID(x));

		return this.fetchLink({ method: 'put', mode: 'raw', rel: 'edit', data })
			.then(() => this.onChange('friends'))
			.then(() => this) //always fulfill with 'this' (don't leak new/raw instances)
			.catch(e => {
				friends.splice(index, 0, item); // put the item back.

				//continue the failure.
				return Promise.reject(e);
			});
	}

	/**
	 * Update the friends list with with a new list of entities by
	 * overwriting any existing friends list.
	 *
	 * @param {...string|Entity} entities The new list of entities.
	 * @returns {Promise} To fulfill if successful, or reject with an error.
	 */
	async update(...entities) {
		if (!this.isModifiable) {
			throw new Error('Model is not Modifiable');
		}

		let data = this.getData();
		data.friends = [...entities.map(x => getID(x))];

		return this.fetchLink({ method: 'put', mode: 'raw', rel: 'edit', data })
			.then(o => this.refresh(pluck(o, 'NTIID', 'friends')))
			.then(() => this.onChange('friends'))
			.then(() => this); //always fulfill with 'this' (don't leak new/raw instances)
	}

	updateFields = fields => {
		const preProcessors = {
			friends: friends => [...friends.map(f => getID(f))],
		};

		const pre = field => preProcessors[field] || (x => x);

		const data = this.getData();
		Object.entries(fields).forEach(
			([field, value]) => (data[field] = pre(field)(value))
		);

		return this.fetchLink({ method: 'put', mode: 'raw', rel: 'edit', data })
			.then(o =>
				this.refresh(
					pluck.apply(void 0, [o, 'NTIID', ...Object.keys(fields)])
				)
			)
			.then(() => this.onChange())
			.then(() => this); //always fulfill with 'this' (don't leak new/raw instances)
	};

	getID() {
		return this.ID;
	}
}

Registry.register(FriendsList);
