/**
 * @template {import('../../../types').Constructor} T
 * @param {T} Target
 * @mixin
 */
export default Target =>
	class AssignmentIdentity extends Target {
		get isAssignment() {
			return true;
		}
	};
