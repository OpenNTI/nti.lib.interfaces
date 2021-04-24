export default Target =>
	class QuestionIdentity extends Target {
		get isQuestion() {
			return true;
		}
	};
