/**
 * @template {import('../types').Constructor} T
 * @param {T} Base
 * @mixin
 */
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
