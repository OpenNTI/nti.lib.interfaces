export default Target =>
	class CourseIdentity extends Target {
		get isCourse() {
			return true;
		}
	};
