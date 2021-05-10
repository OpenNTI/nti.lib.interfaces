export default Base =>
	class extends Base {
		getAssessedRoot() {
			let p = this.parent();

			if (!p || !p.getAssessedRoot) {
				return this;
			}

			return p.getAssessedRoot();
		}
	};
