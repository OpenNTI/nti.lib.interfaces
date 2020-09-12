const PollTpl = {
	Class: 'Poll',
	MimeType: 'application/vnd.nextthought.napoll',
	content: '',
	parts: []
};

export default {
	hasEvaluations: true,

	getEvaluationsRel: () => 'CourseEvaluations',

	createPoll (data = {}) {
		return this.postToLink(
			this.getEvaluationsRel(),
			{...PollTpl, ...data},
			true
		);
	}
};
