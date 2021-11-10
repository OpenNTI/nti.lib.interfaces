/**
 * @template {import('../../../types').Constructor} T
 * @param {T} Target
 * @mixin
 */
export default Target =>
	class QuestionIdentity extends Target {
		get isQuestion() {
			return true;
		}
	};
