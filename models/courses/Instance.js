import Base from '../Base';
import {
	Service,
	Parser as parse
} from '../../CommonSymbols';

import Url from 'url';
import Stream from '../../stores/Stream';

import emptyFunction from '../../utils/empty-function';
import binDiscussions from '../../utils/forums-bin-discussions';

import AssessmentCollectionStudentView from '../assessment/CollectionStudentView';
import AssessmentCollectionInstructorView from '../assessment/CollectionInstructorView';

const NOT_DEFINED = {reason: 'Not defined'};
const EMPTY_CATALOG_ENTRY = {getAuthorLine: emptyFunction};

const OutlineCache = Symbol('OutlineCache');

export default class Instance extends Base {
	constructor (service, parent, data) {
		super(service, parent, data, {isCourse: true});

		let bundle = this[parse]('ContentPackageBundle');

		bundle.on('change', this.onChange.bind(this));

		this[parse]('ParentDiscussions');
		this[parse]('Discussions');
		this[parse]('Outline');
		this[parse]('SharingScopes');
		this[parse]('ParentSharingScopes');

		delete this.LegacyScopes;

		try {
			this.addToPending(resolveCatalogEntry(service, this));
		} catch (e) {
			console.warn('There was a problem resolving the CatalogEntry! %o', e.stack || e.message || e);
		}
	}


	get isAdministrative () {
		return (this.parent() || {}).isAdministrative || false;
	}


	containsPackage (id) {
		//Are course NTIIDs being passed around like packageIds? If so, this will catch it.
		return this.ContentPackageBundle.containsPackage(id) || this.getID() === id;
	}


	getPresentationProperties () {
		let cce = this.CatalogEntry || EMPTY_CATALOG_ENTRY,
			bundle = this.ContentPackageBundle;

		return {
			author: cce.getAuthorLine() || bundle.author,
			title: cce.Title || bundle.title,
			label: cce.ProviderUniqueID,
			icon: cce.icon || bundle.icon,
			background: cce.background || bundle.background,
			thumb: cce.thumb || bundle.thumb
		};
	}


	//Should only show assignments if there is an AssignmentsByOutlineNode link
	shouldShowAssignments () {
		return !!this.getLink('AssignmentsByOutlineNode');
	}

	getActivity () {
		if (!this.hasLink('CourseRecursiveStreamByBucket')) {
			return null;
		}

		return new Stream(
			this[Service],
			this,
			this.getLink('CourseRecursiveStreamByBucket'),
			{
				sortOn: 'createdTime',
				sortOrder: 'descending',
				batchStart: 0,
				batchSize: 10
			}
		);
	}


	getAssignments () {
		const KEY = Symbol.for('GetAssignmentsRequest');
		const parent = this.parent();
		const getLink = rel => (parent && parent.getLink(rel)) || this.getLink(rel);
		const {isAdministrative} = this;

		if (!parent || !parent.isEnrollment) {
			console.warn('Potentially Wrong CourseInstance reference');
		}


		let i = this[Service];
		let p = this[KEY];

		if (!this.shouldShowAssignments()) {
			return Promise.reject('No Assignments');
		}

		if (!p) {
			// A/B sets... Assignments are the Universe-Set minus the B set.
			// The A set is the assignments you can see.
			let A = this.fetchLink('AssignmentsByOutlineNode');
			let B = this.fetchLink('NonAssignmentAssessmentItemsByOutlineNode');

			let historyLink = getLink('AssignmentHistory');
			let gradebookLink = this.getLink('GradeBook');

			p = this[KEY] = Promise.all([
				A, //AssignmentsByOutlineNode
				B, //NonAssignmentAssessmentItemsByOutlineNode

				historyLink,

				gradebookLink
			])
				.then(a => isAdministrative
					? new AssessmentCollectionInstructorView(i, this, ...a)
					: new AssessmentCollectionStudentView(i, this, ...a));
		}

		return p;
	}


	getDiscussions () {
		function logAndResume (reason) {
			if (reason !== NOT_DEFINED) {
				console.warn('Could not load board: %o', reason);
			}
		}

		let contents = o => o ? o.getContents() : Promise.reject(NOT_DEFINED);
		let getId = o => o ? o.getID() : null;

		let sectionId = getId(this.Discussions);
		let parentId = getId(this.ParentDiscussions);

		return Promise.all([
			contents(this.Discussions).catch(logAndResume),
			contents(this.ParentDiscussions).catch(logAndResume)
		])
			.then(data => {
				let [section, parent] = data;

				if (section) {
					section.NTIID = sectionId;
				}

				if (parent) {
					parent.NTIID = parentId;
				}

				return binDiscussions(section, parent);
			});
	}


	hasDiscussions () {
		return !!(this.Discussions || this.ParentDiscussions);
	}


	getOutline () {
		if (!this[OutlineCache]) {
			//We have to wait for the CCE to load to know if its in preview mode or not.
			this[OutlineCache] = this.waitForPending().then(()=>
					//If preview, block outline
					this.CatalogEntry.Preview ?
						Promise.reject('Preview') :
						//not preview, Load contents...
						this.Outline.getContent());
		}
		return this[OutlineCache];
	}


	getOutlineNode (id) {
		return this.getOutline()
			.then(outline => outline.getNode(id) || Promise.reject('Outline Node not found'));
	}


	getVideoIndex () {

		function combine (list) {
			return !list || list.length === 0 ? null : list.reduce((a, b)=> a.combine(b));
		}

		function getForNode (node, index, output) {
			let id = node.getID();

			let scoped = id && index.scoped(id);

			if (scoped && scoped.length) {
				output.push(scoped);
			}

			let {contents} = node;
			if (contents && contents.length) {
				contents.forEach(n=>getForNode(n, index, output));
			}
		}

		return Promise.all([
			this.getOutline(),
			Promise.all(
				this.ContentPackageBundle.map(pkg=>pkg.getVideoIndex()))
					.then(indices => combine(indices))
		])
			.then(outlineAndRawIndex => {
				let [outline, index] = outlineAndRawIndex;
				let slices = [];

				getForNode(outline, index, slices);

				return combine(slices);
			});
	}


	resolveContentURL (url) {
		let bundle = this.ContentPackageBundle;
		let pkg = ((bundle && bundle.ContentPackages) || [])[0];//probably should search all packages...

		let root = Url.parse(pkg.root);

		return Promise.resolve(root.resolve(url));
	}


	getDefaultShareWithValue (/*preferences*/) {
		let parentScopes = this.ParentSharingScopes;

		//see definition of defaultScope "getter"
		let {defaultScopeId, defaultScope} = this.SharingScopes || {};

		if (!defaultScope && parentScopes) {
			defaultScope = parentScopes.getScopeForId(defaultScopeId);
		}

		return Promise.resolve([ defaultScope ].filter(x => x));
	}


	getSharingSuggestions () {
		const parent = this.parent();
		if (!parent || !parent.isEnrollment) {
			console.warn('Potentially Wrong CourseInstance reference');
		}

		if (parent && parent.getSharingSuggestions) {
			return parent.getSharingSuggestions();
		}

		const getScope = (x, y) => x && x.getScope(y);
		let sectionScopes = this.SharingScopes;
		let parentScopes = this.ParentSharingScopes;

		let {defaultScope, defaultScopeId} = sectionScopes || {};

		let parentPublic = getScope(parentScopes || sectionScopes, 'Public');

		let suggestions = [];

		if (!defaultScope && parentScopes) {
			defaultScope = parentScopes.getScopeForId(defaultScopeId);
		}

		if (parentPublic) {
			let allStudents = Object.create(parentPublic, {
				generalName: {value: 'All Students'}
			});

			suggestions = [...suggestions, allStudents];
		}

		if (defaultScope && defaultScope !== parentPublic) {
			let classmates = Object.create(defaultScope, {
				generalName: {value: 'My Classmates'}
			});

			suggestions = [...suggestions, classmates];
		}


		return Promise.resolve(suggestions);
	}
}


//Private methods

function resolveCatalogEntry (service, inst) {
	let cache = service.getDataCache();
	let url = inst.getLink('CourseCatalogEntry');
	if (!url) {
		throw new Error('No CCE Link!');
	}
	let cached = cache.get(url);

	let work;

	if (cached) {
		work = Promise.resolve(cached);
	} else {
		work = service.get(url).then(d=> cache.set(url, d) && d);
	}

	return work.then(cce =>
		(inst.CatalogEntry = inst[parse](cce)).waitForPending());
}
