/**
 * @template {import('../../../types').Constructor} T
 * @param {T} Target
 * @mixin
 */
export default Target =>
	class SubmittableIdentity extends Target {
		get isSubmittable() {
			return true;
		}
	};
