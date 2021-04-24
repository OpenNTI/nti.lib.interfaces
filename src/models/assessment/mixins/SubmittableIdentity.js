export default Target =>
	class SubmittableIdentity extends Target {
		get isSubmittable() {
			return true;
		}
	};
