import Url from 'url';
import path from 'path';

import {mixin} from 'nti-lib-decorators';
import Logger from 'nti-util-logger';
import {wait} from 'nti-commons';

import {
	MEDIA_BY_OUTLINE_NODE,
	NO_LINK,
	Service,
	Parser as parse
} from '../../constants';
import AssessmentCollectionStudentView from '../assessment/assignment/CollectionStudentView';
import AssessmentCollectionInstructorView from '../assessment/assignment/CollectionInstructorView';
import Roster from '../../stores/CourseRoster';
import binDiscussions from '../../utils/forums-bin-discussions';
import MediaIndex from '../media/MediaIndex';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

import ActivityStream from './BucketedActivityStream';
import CourseIdentity from './mixins/CourseIdentity';

const logger = Logger.get('models:courses:Instance');

const emptyFunction = () => {};
const NOT_DEFINED = {reason: 'Not defined'};
const EMPTY_CATALOG_ENTRY = {getAuthorLine: emptyFunction};

const MEDIA_INDEX = Symbol('Media Index');

const OutlineCache = Symbol('OutlineCache');
const OutlineCacheUnpublished = Symbol('OutlineCacheUnpublished');
const RENAME = Symbol.for('TakeOver');

export default
@model
@mixin(CourseIdentity)
class Instance extends Base {
	static MimeType = [
		COMMON_PREFIX + 'courses.courseinstance',
		COMMON_PREFIX + 'courses.legacycommunitybasedcourseinstance',
	]

	constructor (service, parent, data) {
		super(service, parent, data);

		let bundle = this[parse]('ContentPackageBundle');
		if (/legacy/i.test(this.MimeType)) {
			Object.defineProperty(this, 'isLegacy', {get:() => true});
		}

		if (bundle) {
			bundle.on('change', this.onChange.bind(this));
		}

		this[parse]('GradeBook');
		this[parse]('ParentDiscussions');
		this[parse]('Discussions');
		this[parse]('Outline');
		this[parse]('SharingScopes');
		this[parse]('ParentSharingScopes');

		/*try {
			logger.debug(`
			Title:  ${this.title}
			Total:  ${data.TotalEnrolledCount}
			Open:   ${data.TotalLegacyOpenEnrolledCount}
			Credit: ${data.TotalLegacyForCreditEnrolledCount}
			`);
		} catch (e) {
			logger.error(e.stack);
		}*/

		this[RENAME]('TotalEnrolledCount', 'enrolledTotalCount');
		this[RENAME]('TotalLegacyOpenEnrolledCount', 'enrolledOpenlyTotalCount');
		this[RENAME]('TotalLegacyForCreditEnrolledCount', 'enrolledForCreditTotalCount');

		delete this.LegacyScopes;

		try {
			this.addToPending(resolveCatalogEntry(service, this));
		} catch (e) {
			let x = e.stack || e.message || e;
			let t = typeof x === 'string' ? '%s' : '%o';
			logger.warn('Instance: %s\n'
				+ 'Enrollment: %s\n'
				+ 'There was a problem resolving the CatalogEntry!\n' + t,

			this.NTIID || this.OID,
			parent ? (parent.NTIID || parent.OID) : 'Unknown',
			x);
		}
	}


	get title () {
		const {title} = this.getPresentationProperties() || {};
		return title;
	}


	get ProviderUniqueID () {
		return (this.CatalogEntry || EMPTY_CATALOG_ENTRY).ProviderUniqueID;
	}


	get root () {
		//This needs to go away. fast.
		//We're using this to prefix the RELATIVE hrefs in the Video Transcript data.
		//We're doing something similar for Content in Questions (assets are relative coming back)
		//All content given to the client in JSON form should have full hrefs. No Relative hrefs.
		return this.ContentPackageBundle.packageRoot;
		//Furthermore this breaks as soon as we have bundles with more than one package.
	}


	get isAdministrative () {
		return (this.parent() || {}).isAdministrative || false;
	}


	delete (rel = 'delete') {
		//cleanup the potential cache
		const cache = this[Service].getDataCache();
		const url = this.getLink('CourseCatalogEntry');
		if (url) {
			cache.set(url, null);
		}

		return super.delete(rel);
	}


	containsPackage (id) {
		//Are course NTIIDs being passed around like packageIds? If so, this will catch it.
		return this.ContentPackageBundle.containsPackage(id) || this.getID() === id;
	}

	getPackage (id) {
		return this.ContentPackageBundle.getPackage(id);
	}


	getPresentationProperties () {
		let cce = this.CatalogEntry || EMPTY_CATALOG_ENTRY,
			bundle = this.ContentPackageBundle;

		return {
			author: cce.getAuthorLine() || (bundle && bundle.author),
			title: cce.Title || (bundle && bundle.title),
			label: cce.ProviderUniqueID,
			icon: cce.icon || (bundle && bundle.icon),
			background: cce.background || (bundle && bundle.background),
			thumb: cce.thumb || (bundle && bundle.thumb)
		};
	}


	getRoster () {
		const link = this.getLink('CourseEnrollmentRoster');
		if (!link) {
			return null;
		}

		return new Roster(
			this[Service],
			this,
			link,
			{
				batchSize: 50,
				batchStart: 0
			}
		);
	}


	getActivity () {
		if (!this.hasLink('CourseRecursiveStreamByBucket')) {
			return null;
		}

		const courseStart = this.CatalogEntry.getStartDate();

		return new ActivityStream(
			this[Service],
			this,
			this.getLink('CourseRecursiveStreamByBucket', {
				NonEmptyBucketCount: 2,
				BucketSize: 50,
				//the server is expecting seconds
				Oldest: Math.round(courseStart.getTime() / 1000)
			}),
			this.getOutline(),
			this.getAssignments()
		);
	}


	getResources () {
		return this.fetchLinkParsed('resources');
	}

	//Should only show assignments if there is an AssignmentsByOutlineNode link
	shouldShowAssignments () {
		return !!this.getLink('AssignmentsByOutlineNode');
	}


	getAssignments () {
		const KEY = Symbol.for('GetAssignmentsRequest');
		const parent = this.parent();
		const getLink = rel => (parent && parent.getLink && parent.getLink(rel)) || this.getLink(rel);
		const {isAdministrative} = this;

		if (!parent || !parent.isEnrollment) {
			logger.warn('Potentially Wrong CourseInstance reference');
		}


		let i = this[Service];
		let p = this[KEY];

		if (!this.shouldShowAssignments()) {
			return Promise.reject('No Assignments');
		}

		if (!p) {
			// A/B sets... Assignments are the Universe-Set minus the B set.
			// The A set is the assignments you can see.
			let A = this.fetchLink('AssignmentSummaryByOutlineNode');
			let B = this.fetchLink('NonAssignmentAssessmentSummaryItemsByOutlineNode');

			let historyLink = getLink('AssignmentHistory');

			p = this[KEY] = Promise.all([
				A, //AssignmentsByOutlineNode
				B //NonAssignmentAssessmentItemsByOutlineNode
			])
				.then(a => isAdministrative
					? new AssessmentCollectionInstructorView(i, this, ...a, historyLink, this.GradeBook)
					: new AssessmentCollectionStudentView(i, this, ...a, historyLink));
		}

		return p;
	}


	getAllAssignments () {
		return this.getAssignments()
			.then(assignments => assignments.getAssignments());
	}


	getAssignment (ntiid) {
		const service = this[Service];
		const href = this.getLink('Assessments');
		// href will be something like this...
		//		/dataserver2/%2B%2Betc...site/Courses/Alpha/NTI%201000/@@Assessments
		//
		// we will want to append the ntiid to the end:
		//		/dataserver2/%2B%2Betc...site/Courses/Alpha/NTI%201000/@@Assessments/<ntiid>

		if (!href) {
			return Promise.reject(NO_LINK);
		}

		const assignemntParentRef = this;//the CourseInstance,
		//tho, probably should be the Assignemnts Collection but we may not have that...
		//the instance caches are on the service doc so we're covered there.

		const parseResult = o => service.getObject(o, {parent: assignemntParentRef});
		const uri = Url.parse(href);

		uri.pathname = path.join(uri.pathname, encodeURIComponent(ntiid));

		const url = uri.format();

		return service.get(url)
			.then(parseResult);
	}


	getCourseDiscussions () {
		const service = this[Service];
		const url = this.getLink('CourseDiscussions');
		//For now make the course the parent.
		const discussionParentRef = this;
		const parseItem = o => service.getObject(o, {parent: discussionParentRef});

		if (!url) {
			return Promise.resolve([]);
		}

		return service.get(url)
			.then((json) => {
				const {Items:items} = json;

				return Promise.all(items.map(parseItem));
			});
	}


	getDiscussions () {
		function logAndResume (reason) {
			if (reason !== NOT_DEFINED) {
				logger.warn('Could not load board: %o', reason);
			}
		}

		let contents = o => o ? o.getContents() : Promise.reject(NOT_DEFINED);
		let getID = o => o ? o.getID() : null;

		let sectionId = getID(this.Discussions);
		let parentId = getID(this.ParentDiscussions);

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

	/**
	 * Get the Outline for this course instance.
	 *
	 * @param {object} [options] - An object of options
	 * @param {boolean} [options.force] - Force a new request, bypass & replace caches.
	 * @param {boolean} [options.unpublished] - include the unpublished nodes.
	 * @returns {Promise} fulfills with the outline, or rejects on error.
	 */
	getOutline (options) {
		const legacy = (typeof options === 'boolean' && options); //backwards compatability
		const {force, unpublished = legacy} = options || {};

		const FIVE_MINUTES = 300000;//5min in milliseconds.
		const key = unpublished ? OutlineCacheUnpublished : OutlineCache;

		if (!this[key] || force) {
			//We have to wait for the CCE to load to know if its in preview mode or not.
			this[key] = this.waitForPending().then(()=>
				//If preview, block outline
				this.CatalogEntry.Preview
					? Promise.reject('Preview')
					//not preview, Load contents...
					: this.Outline.getContent(options));
		}

		//Simple Promise wrapper... if the wrapped promise rejects, this will also reject.
		const p = this[key] = Promise.resolve(this[key]);

		//Keep the promise for the life of the request,
		//and if the normal published-only, add an additional 5 minutes.
		//If requested again, reset the wait timer.
		wait.on(p)
			.then(() => key === OutlineCache && wait(FIVE_MINUTES))
			.then(() => {
				//only perform the cleanup op if and only if the promise at the key is OUR promise.
				if (this[key] === p) {
					delete this[key];
				}
			});

		return this[key];
	}


	/**
	 * Gets an outline node by id.
	 * @param {string} id - the outlineNode id. (ntiid)
	 * @param {object} [options] - options to pass to getOutline().
	 * @returns {Promise} fulfills with outline node, or rejects if not found.
	 */
	getOutlineNode (id, options) {
		return this.getOutline(options)
			.then(outline => outline.getNode(id) || Promise.reject('Outline Node not found'));
	}


	getMediaIndex () {
		let promise = this[MEDIA_INDEX];
		let MAX_AGE = 3600000; //One Hour

		if (!promise || promise.stale) {
			let start = Date.now();

			promise = this[MEDIA_INDEX] = this.fetchLink(MEDIA_BY_OUTLINE_NODE)
				.then(x => MediaIndex.build(this[Service], this, x.ContainerOrder || [], x));

			Object.defineProperty(promise, 'stale', {
				enumerable: false,
				get: () => (Date.now() - start) > MAX_AGE
			});
		}

		return promise;
	}


	getVideoIndex () {
		if(!this.ContentPackageBundle) {
			return Promise.reject('No content bundle for this course instance');
		}

		function getForNode (node, index, output) {
			let id = node.getContentId();

			let scoped = id && index.scoped(id);

			if (scoped && scoped.length) {
				output.push(scoped);
			}

			let {contents} = node;
			if (contents && contents.length) {
				contents.forEach(n=>getForNode(n, index, output));
			}
		}

		if (this.hasLink(MEDIA_BY_OUTLINE_NODE)) {
			return this.getMediaIndex()
				.then(i => i.filter(x => x && x.isVideo));
		}

		return Promise.all([
			this.getOutline(),
			this.ContentPackageBundle.getVideoIndex()
		])
			.then(outlineAndRawIndex => {
				let [outline, index] = outlineAndRawIndex;
				let slices = [];

				getForNode(outline, index, slices);

				return MediaIndex.combine(slices);
			});
	}


	resolveContentURL (url) {
		let bundle = this.ContentPackageBundle;
		let pkgs = ((bundle && bundle.ContentPackages) || []);//probably should search all packages...
		let pkg = pkgs.find(x => x.root);

		let root = pkg && Url.parse(pkg.root);

		return Promise.resolve(root ? root.resolve(url) : url);
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
			logger.warn('Potentially Wrong CourseInstance reference');
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

async function resolveCatalogEntry (service, inst) {
	// The intent and purpose of this cache is to transmit work done by the web-service to the the client...
	// We do NOT want to cache new entries on the client...and we should clear the cache on first read...
	const cache = service.getDataCache();
	const url = inst.getLink('CourseCatalogEntry');
	if (!url) {
		throw new Error('No CCE Link!');
	}

	const cached = cache.get(url);
	cache.set(url, null); //clear the cache on read...we only want to cache it for the initial page load.

	const cce = await (cached)
		? Promise.resolve(cached)
		: service.get(url)
			.then(d => (!cache.isClientInstance && cache.set(url, d), d));

	const resolved = await cce;

	const entry = inst.CatalogEntry = inst[parse](resolved);

	return await entry.waitForPending();
}
