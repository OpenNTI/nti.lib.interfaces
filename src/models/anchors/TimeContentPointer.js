import {model, COMMON_PREFIX} from '../Registry';

import ContentPointer from './ContentPointer';

const VALID_ROLES = ['start', 'end'];

@model
export default class TimeContentPointer extends ContentPointer {
	static MimeType = COMMON_PREFIX + 'contentrange.timecontentpointer'

	constructor (service, parent, data, ...mixins) {
		super(service, parent, data, {Class: 'TimeContentPointer'}, ...mixins);

		//Ugh. The first implementation, prior to exposing to end-users, used seconds.
		//Apparently, when the server started modeling this on their end, they didn't
		//want to serialize floating points. So they pushed back and had the field be
		//an integer... instead of renaming the field to 'milliseconds', it was left
		//as seconds... so we must convert it on load. ...on serialize we will
		//translate it back. See translate:seconds() below.
		this.seconds = parseInt(this.seconds, 10) / 1000;

		this.validateRole(this.role);
	}

	getRole () { return this.role; }
	getSeconds () { return this.seconds; }


	/**
	 * Translates the seconds value back into milliseconds.
	 * See comment in constructor on this.seconds.
	 *
	 * This is called by the JSONValue mixin, in the #getData() method
	 * when it tries to read the `seconds` property.
	 *
	 * @return {number} milliseconds
	 */
	['translate:seconds'] () {
		return Math.floor(this.seconds * 1000);
	}

	validateRole (r) {
		if (!r) {
			throw new Error('Must supply a role');
		}
		else if (!VALID_ROLES.includes(r)) {
			throw new Error('Role must be of the value ' + VALID_ROLES.join(',') + ', supplied ' + r);
		}
	}
}
