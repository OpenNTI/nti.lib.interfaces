export default Target =>
	class AssignmentIdentity extends Target {
		get isAssignment() {
			return true;
		}
	};
