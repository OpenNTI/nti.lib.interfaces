import { Service } from '../constants';

export default class FiveMinuteInterface {
	static fromService(service) {
		return new FiveMinuteInterface(service);
	}

	constructor(service) {
		this[Service] = service;
	}

	getAppUser() {
		return this[Service].getAppUser();
	}

	getAdmissionStatus() {
		return this.getAppUser().then(
			user => (user || {}).fmaep_admission_state
		);
	}

	getUserLink(rel) {
		return this.getAppUser().then(user => user.getLink(rel));
	}

	preflight(data) {
		// get the preflight link.
		return (
			this.getUserLink('fmaep.admission.preflight')
				// post the data to the link
				.then(link => this[Service].post(link, data))
		);
	}

	requestAdmission(data) {
		return this.getUserLink('fmaep.admission').then(link =>
			this[Service].post(link, data)
		);
	}

	requestConcurrentEnrollment(data) {
		return this.getUserLink('concurrent.enrollment.notify').then(link =>
			this[Service].post(link, data)
		);
	}

	getPayAndEnroll(link, ntiCrn, ntiTerm, returnUrl) {
		return this[Service].post(link, {
			crn: ntiCrn,
			term: ntiTerm,
			//We don't control the name "return_url", so ignore the error
			return_url: returnUrl,
		});
	}
}
