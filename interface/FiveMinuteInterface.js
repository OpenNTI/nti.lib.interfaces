/**
 * This is an OU API, perhaps we should bury this deeper in to the package?
 *
 * Like:
 *	/interface/thirdparties/ou/FiveMinute.js
 *
 */

import ServiceModel from '../stores/Service';

import {Context, Server} from '../CommonSymbols';

const getAppUser = 'Get the Active User';
const getUserLink = 'Get Link from User';

export default class FiveMinuteInterface {
	static fromService (service) {
		let server = service[Server];
		let context = service[Context];
		return new this(server, context);
	}


	constructor (server, context) {
		Object.assign(this, {
			get: ServiceModel.prototype.get,
			post: ServiceModel.prototype.post
		});
		this[Server] = server;
		this[Context] = context;
	}

	getServer () { return this[Server]; }

	[getAppUser] () {
		//FIXME: This doesn't leverage our instance cache.
		//This will create a new Service Doc instance (as well
		// as a new App User model instance)
		return this[Server].getServiceDocument().then(doc=>doc.getAppUser());
	}

	getAdmissionStatus () {
		return this[getAppUser]()
			.then(user=>(user || {}).fmaep_admission_state);
	}

	[getUserLink] (rel) {
		return this[getAppUser]().then(user=>user.getLink(rel));
	}

	preflight (data) {
		// get the preflight link.
		let p = this[getUserLink]('fmaep.admission.preflight');

		// post the data to the link
		let r = p.then(link => this.post(link, data));

		return r;
	}

	requestAdmission (data) {
		console.debug('five minute service requestAdmission');
		let getLink = this[getUserLink]('fmaep.admission');
		let r = getLink.then(link => this.post(link, data));
		return r;
	}

	requestConcurrentEnrollment (data) {
		return this[getUserLink]('concurrent.enrollment.notify')
			.then(link => this.post(link, data));
	}

	getPayAndEnroll (link, ntiCrn, ntiTerm, returnUrl) {
		console.debug(link);
		return this.post(link, {
			crn: ntiCrn,
			term: ntiTerm,
			//We don't control the name "return_url", so ignore the error
			return_url: returnUrl // eslint-disable-line camelcase
		});
	}
}
