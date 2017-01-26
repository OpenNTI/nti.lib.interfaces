export default {

	getAssessedRoot () {

		let p = this.parent();

		if (!p || !p.getAssessedRoot) {
			return this;
		}

		return p.getAssessedRoot();
	}

};
