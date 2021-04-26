import { isEmpty } from '@nti/lib-commons';

import Registry, { COMMON_PREFIX } from '../Registry.js';
import { Service } from '../../constants.js';
import Base from '../Base.js';

const INPUT_STATES = new Set(['composing', 'paused']);
export default class RoomInfo extends Base {
	static MimeType = [
		COMMON_PREFIX + '_meeting',
		COMMON_PREFIX + 'meeting',
		COMMON_PREFIX + 'roominfo',
	];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Active':       { type: 'boolean',  name: 'isActive'     },
		'MessageCount': { type: 'number',   name: 'messageCount' },
		'Moderated':    { type: 'boolean',  name: 'isModerated'  },
		'Moderators':   { type: 'string[]', name: 'moderators'   },
		'Occupants':    { type: 'string[]', name: 'occupants'    },
		'inReplyTo':    { type: 'string'                         },
		'references':   { type: 'string[]'                       },
	}

	#states = {};
	#originalOccupants;

	get isModerator() {
		return this.moderators?.includes(this[Service].getAppUsername());
	}

	get isGroupChat() {
		let participants = this.getOriginalOccupants();

		if (isEmpty(participants)) {
			participants = this.cccupants;
		}

		return participants.length > 2;
	}

	getAllRoomStates() {
		return this.#states;
	}

	getRoomState(user) {
		return this.#states[user];
	}

	setRoomState(user, state) {
		this.#states[user] = state;
	}

	getInputTypeStates() {
		const p = [];

		for (const user of this.occupants) {
			const userState = this.getRoomState(user);

			if (INPUT_STATES.has(userState) && !this.isAppUser(user)) {
				p.push({ user: user, state: userState });
			}
		}

		return p;
	}

	/*
	 *	NOTE: We want to add an additional property 'OriginalOccupants' that we will use to compare 1-1 rooms with the same occupants(to see if we can merge them.)
	 *	Because Occupants property only contain the live list of occupants and
	 *	some occupants might have left the chat before, the original occupants will help to compare chat rooms with the same occupants.
	 */

	setOriginalOccupants(occupants) {
		this.#originalOccupants = occupants;
	}

	getOriginalOccupants() {
		return this.#originalOccupants || [];
	}

	getOccupantsKey() {
		let occupants = this.getOriginalOccupants();
		if (occupants.length === 0) {
			occupants = this.occupants;
		}

		return occupants.slice().sort().join('_');
	}
}

Registry.register(RoomInfo);
