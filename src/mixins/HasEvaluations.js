const PollTpl = {
	Class: 'Poll',
	MimeType: 'application/vnd.nextthought.napoll',
	content: '',
	parts: [],
};

export default Target =>
	class extends Target {
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
