import Base from '../Base';
import {
	Service,
	Parser as parse
} from '../../CommonSymbols';

import Url from 'url';

import emptyFunction from '../../utils/empty-function';

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
		let getId = o => o ? o.getID(): null;

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
		return Promise.all(
			this.ContentPackageBundle.map(pkg=>pkg.getVideoIndex()))
				.then(indices =>
					indices.reduce((a, b) =>a.combine(b)));
	}


	resolveContentURL (url) {
		let bundle = this.ContentPackageBundle;
		let pkg = ((bundle && bundle.ContentPackages) || [])[0];//probably should search all packages...

		let root = Url.parse(pkg.root);

		return Promise.resolve(root.resolve(url));
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


/**
 * Takes two arrays of forums and bins then
 *
 *	1.) by for credit or open
 *	2.) by if they are for this section or the parent
 *
 * returns an object that looks like:
 *
 *	{
 *		ForCredit: {
 *			Section: {id: String, items: Array[Forum]},
 *			Parent: {id: String, items: Array[Forum]}
 *		},
 *		Open: {
 *			Section: {id: String, items: Array[Forum]},
 *			Parent: {id: String, items: Array[Forum]}
 *		},
 *		Other: ...(same as above)
 *	}
 *
 * @param  {Object} section Object of forums in this section
 * @param  {Object} parent  Object of forums in the parent if there are any
 * @return {Object}        The binned forums
 */
function binDiscussions (section, parent) {
	let bins = {};

	function addTo(key, group) {

		let items = (group && group.Items) || [];
		for(let item of items) {
			let bin = item.getBin();
			if (!bins[bin]) {
				bins[bin] = {};
			}

			bin = bins[bin];
			if (!bin[key]) {
				bin[key] = {id: group.NTIID, forums: []};
			}

			if (bin[key].id !== group.NTIID) {
				console.error('Bad ID match');
			}

			bin[key].forums.push(item);
		}
	}

	addTo('Section', section);
	addTo('Parent', parent);

	return bins;
}
