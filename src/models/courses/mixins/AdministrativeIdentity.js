export default Target =>
	class AdministrativeIdentity extends Target {
		get isAdministrative() {
			return true;
		}
	};
