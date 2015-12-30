import Enrollment from './Enrollment';

export default class InstanceAdministrativeRole extends Enrollment {
	constructor (service, data) {
		super(service, data);

		this.isAdministrative = true;

		//RoleName
	}


	getSharingSuggestions () {
		let {CourseInstance} = this;

		let sectionScopes = CourseInstance.SharingScopes;
		let parentScopes = CourseInstance.ParentSharingScopes;

		let {containsDefault} = sectionScopes || {};

		let suggestions = [];

		if (containsDefault) {
			let sectionName = parentScopes ? 'My Section' : void 0;

			suggestions = [...suggestions, ...buildSuggestionsFrom(sectionScopes, sectionName)];
		}

		if (parentScopes) {
			let sectionName = containsDefault ? 'All Sections' : void 0;

			suggestions = [...suggestions, ...buildSuggestionsFrom(parentScopes, sectionName)];
		}

		return Promise.resolve( suggestions );
	}
}



function buildSuggestionsFrom (scopes, sectionName = 'My Course') {
	const order = ['Default', 'Public', 'Purchased', 'ForCredit', 'ForCreditNonDegree'];
	const generalNames = {
		Default: 'Default Scope',
		Public: 'All Students in {sectionName}',
		Purchased: 'Life Long Learn Students in {sectionName}',
		ForCredit: 'For Credit Students in {sectionName}',
		ForCreditNonDegree: 'Five Minute Enrollment Students in {sectionName}'
	};

	let items = [];
	let {defaultScopeId} = scopes;

	for (let name of order) {
		let scope = scopes.getScope(name);
		//Skip this iteration if the scope is falsy, or
		// if the scope's id matches the default scope's (and we've already included it)
		if (!scope || (scope.getID() === defaultScopeId && items.find(x=> x === defaultScopeId))) {
			continue;
		}

		let generalName = generalNames[name];
		if (generalName) {
			generalName = generalName.replace('{sectionName}', sectionName);
		}

		items.push(
			generalName
				? Object.create( scope, {
					generalName: {value: generalName}})
				: scope );

	}

	return items;
}