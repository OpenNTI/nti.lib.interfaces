const PollTpl = {
	Class: 'Poll',
	MimeType: 'application/vnd.nextthought.napoll',
	content: '',
	parts: [],
};

/**
 * @template {import('../constants').Constructor} T
 * @param {T} Base
 * @mixin
 */
export default Base =>
	class extends Base {
		hasEvaluations = true;

		getEvaluationsRel() {
			return 'CourseEvaluations';
		}

		createPoll(data = {}) {
			return this.postToLink(
				this.getEvaluationsRel(),
				{ ...PollTpl, ...data },
				true
			);
		}
	};
