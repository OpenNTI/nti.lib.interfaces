import Base from '../Base';
import {
	Service,
	Parser as parse
} from '../../CommonSymbols';

import Url from 'url';

import emptyFunction from '../../utils/empty-function';
import binDiscussions from '../../utils/forums-bin-discussions';

import AssessmentCollection from '../assessment/Collection';

const NOT_DEFINED = {reason: 'Not defined'};
const EMPTY_CATALOG_ENTRY = {getAuthorLine: emptyFunction};

const OutlineCache = Symbol('OutlineCache');

export default class Instance extends Base {
	constructor (service, parent, data) {
		super(service, parent, data, {isCourse: true});

		let bundle = this[parse]('ContentPackageBundle');

		bundle.on('changed', this.onChange.bind(this));

		this[parse]('ParentDiscussions');
		this[parse]('Discussions');
		this[parse]('Outline');

		this.addToPending(resolveCatalogEntry(service, this));
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


	getAssignments () {
		let key = Symbol.for('GetAssignmentsRequest');

		let i = this[Service];
		let p = this[key];


		// A/B sets... Assignments are the Universe-Set minus the B set.
		// The A set is the assignmetns you can see.
		let A = this.getLink('AssignmentsByOutlineNode');
		let B = this.getLink('NonAssignmentAssessmentItemsByOutlineNode');

		if (!this.shouldShowAssignments()) {
			return Promise.reject('No Assignments');
		}

		if (!p) {
			p = this[key] = Promise.all([
				i.get(A), //AssignmentsByOutlineNode
				i.get(B), //NonAssignmentAssessmentItemsByOutlineNode
				this.ContentPackageBundle.getTablesOfContents()
			])
				.then(a => new AssessmentCollection(i, this, ...a));
		}

		return p;
	}


	getDiscussions () {
		function logAndResume(reason) {
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
		let outline = this.Outline;
		if (!this[OutlineCache]) {
			//We have to wait for the CCE to load to know if its in preview mode or not.
			this[OutlineCache] = this.waitForPending().then(()=>
					//If preview, block outline
					this.CatalogEntry.Preview ?
						Promise.reject('Preview') :
						//not preview, Load contents...
						outline.get());
		}
		return this[OutlineCache];
	}


	getOutlineNode (id) {
		return this.getOutline()
			.then(outline => outline.getNode(id) || Promise.reject('Outline Node not found'));
	}


	getVideoIndex () {

		function combine(list) {
			return !list || list.length === 0 ? null : list.reduce((a, b)=> a.combine(b));
		}

		function getForNode(node, index, output) {
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


	getPublicScope () { return this.getScope('Public'); }


	getScope (scope) {
		let s = (this.Scopes || {})[scope.toLowerCase()] || '';//Old...

		/*
		if (this.SharingScopes) {
			s = this.SharingScopes;
			s = s.getScope(scope);
			if (s && typeof s !== 'string') {
				s = s.NTIID;
			}
		}
		*/

		if (typeof s === 'string') {
			s = s.split(' ');
		}

		return s.filter(v => v && v.length > 0);
	}
}


//Private methods

function resolveCatalogEntry(service, inst) {
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
