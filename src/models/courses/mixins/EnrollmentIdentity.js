export default Target =>
	class EnrollmentIdentity extends Target {
		get isEnrollment() {
			return true;
		}
	};
