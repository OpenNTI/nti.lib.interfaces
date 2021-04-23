import Url from 'url';
import path from 'path';

import { decorate, wait } from '@nti/lib-commons';
import { mixin } from '@nti/lib-decorators';
import Logger from '@nti/util-logger';

import { MEDIA_BY_OUTLINE_NODE, NO_LINK, Service } from '../../constants.js';
import { Mixin as ContentTreeMixin } from '../../content-tree/index.js';
import HasEvaluations from '../../mixins/HasEvaluations.js';
import AssessmentCollectionStudentView from '../assessment/assignment/CollectionStudentView.js';
import AssessmentCollectionInstructorView from '../assessment/assignment/CollectionInstructorView.js';
import Roster from '../../stores/CourseRoster.js';
import MediaIndex from '../media/MediaIndex.js';
import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';
import Forum from '../forums/Forum.js';

import CourseAllActivityDataSource from './data-sources/CourseAllActivityDataSource.js';
import CourseCommunity from './CourseCommunity.js';
import ActivityStream from './BucketedActivityStream.js';
import CourseIdentity from './mixins/CourseIdentity.js';
import ContentDataSource from './content-data-source/index.js';
import Outline from './Outline.js';
import Enrollment from './Enrollment.js';

const logger = Logger.get('models:courses:Instance');
const NOT_DEFINED = { reason: 'Not defined' };

const MEDIA_INDEX = Symbol('Media Index');

const CourseCommunityCache = Symbol('Course Community');

const OutlineCache = Symbol('OutlineCache');
const OutlineCacheUnpublished = Symbol('OutlineCacheUnpublished');
const VOID = () => {};

const AvailableContentSummary = Symbol('Available Content Summary');
const AvailableContentSummaryTimeout = 5000;

const KnownActivitySorts = [
	'createdTime',
	'Last Modified',
	'ReferencedByCount',
	'LikeCount',
];

class Instance extends Base {
	static MimeType = [
		COMMON_PREFIX + 'courses.courseinstance',
		COMMON_PREFIX + 'courses.legacycommunitybasedcourseinstance',
	];

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'ContentPackageBundle':              { type: 'model'                                       },
		'Discussions':                       { type: 'model'                                       },
		'GradeBook':                         { type: 'model'                                       },
		'LegacyScopes':                      { type: VOID                                          },
		'Outline':                           { type: 'model'                                       },
		'ParentDiscussions':                 { type: 'model'                                       },
		'ParentSharingScopes':               { type: 'model'                                       },
		'Reports':                           { type: 'model[]'                                     },
		'SharingScopes':                     { type: 'model'                                       },
		'TotalEnrolledCount':                { type: 'number', name: 'enrolledTotalCount'          },
		'TotalLegacyForCreditEnrolledCount': { type: 'number', name: 'enrolledForCreditTotalCount' },
		'TotalLegacyOpenEnrolledCount':      { type: 'number', name: 'enrolledOpenlyTotalCount'    },
		'CompletionPolicy':                  { type: 'model'                                       }
	}

	get isLegacy() {
		return /legacy/i.test(this.MimeType);
	}

	constructor(service, parent, data) {
		super(service, parent, data);

		let bundle = this.ContentPackageBundle;
		if (bundle) {
			bundle.on('change', this.onChange.bind(this));
		}

		this.addToPending(resolvePreferredAccess(service, this, parent));
	}

	get title() {
		const { title } = this.getPresentationProperties() || {};
		return title;
	}

	get ProviderUniqueID() {
		return (this.CatalogEntry || {}).ProviderUniqueID;
	}

	get isAdministrative() {
		return (this.CatalogEntry || {}).IsAdmin || false;
	}

	get canManageEnrollment() {
		return this.hasLink('ManageRoster');
	}

	get canEmailEnrollees() {
		return this.hasLink('Mail');
	}

	delete(rel = 'delete') {
		//cleanup the potential cache
		const cache = this[Service].getDataCache();
		const url = this.getLink('CourseCatalogEntry');
		if (url) {
			cache.set(url, null);
		}

		return super.delete(rel);
	}

	refreshPreferredAccess() {
		return this.fetchLinkParsed('UserCoursePreferredAccess').then(
			enrollment => {
				this.PreferredAccess = enrollment;
				return this;
			}
		);
	}

	containsPackage(id) {
		//Are course NTIIDs being passed around like packageIds? If so, this will catch it.
		return (
			this.ContentPackageBundle?.containsPackage(id) ||
			this.getID() === id
		);
	}

	async getPackage(id) {
		return this.ContentPackageBundle?.getPackage(id);
	}

	getPresentationProperties() {
		const cce = this.PreferredAccess?.getPresentationProperties() || {};
		const bundle = this.ContentPackageBundle;

		return {
			author: cce.author || bundle?.author,
			title: cce.title || bundle?.title,
			label: cce.label,
		};
	}

	getRoster() {
		const link = this.getLink('CourseEnrollmentRoster');
		if (!link) {
			return null;
		}

		return new Roster(this[Service], this, link, {
			batchSize: 50,
			batchStart: 0,
		});
	}

	async getRosterSummary() {
		if (!this.hasLink('RosterSummary')) {
			return null;
		}

		return this.fetchLink('RosterSummary');
	}

	get canInvite() {
		return this.hasLink('SendCourseInvitations');
	}

	async preflightInvitationsCsv(csv) {
		const formData = new FormData();
		formData.append('csv', csv);
		return this.postToLink('CheckCourseInvitationsCSV', formData);
	}

	async sendInvitations(emails, message) {
		const Items = (emails || []).map(email => ({ email }));

		return this.postToLink('SendCourseInvitations', {
			Items,
			message,
			MimeType:
				'application/vnd.nextthought.courses.usercourseinvitations',
		});
	}

	getActivity() {
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
				Oldest: Math.round(courseStart.getTime() / 1000),
			}),
			this.getOutline(),
			this.getAssignments()
		);
	}

	getResources() {
		return this.fetchLinkParsed('resources');
	}

	//Should only show assignments if there is an AssignmentsByOutlineNode link
	shouldShowAssignments() {
		return !!this.getLink('AssignmentsByOutlineNode');
	}

	async createAsset(data) {
		if (!this.hasLink('assets')) {
			throw new Error('No Assets Link');
		}

		const asset = await this.postToLink('assets', data, true);

		if (asset.isVideo) {
			delete this[MEDIA_INDEX];
		}

		return asset;
	}

	getAssets(type) {
		if (Array.isArray(type)) {
			[type] = type;
		}
		return this.fetchLinkParsed('assets', type ? { accept: type } : {});
	}

	async getAssignments() {
		const LOADING = Symbol.for('GetAssignmentsRequest');
		const REFRESH = Symbol.for('RefreshAssignments');
		const service = this[Service];
		const parent = this.parent();
		const getLink = rel =>
			(parent && parent.getLink && parent.getLink(rel)) ||
			this.getLink(rel);
		const { isAdministrative } = this;

		if (!this.shouldShowAssignments()) {
			throw new Error('No Assignments');
		}

		const load = async () => {
			return Promise.all([
				this.fetchLink('AssignmentSummaryByOutlineNode'),
				this.fetchLink(
					'NonAssignmentAssessmentSummaryItemsByOutlineNode'
				),
			]);
		};

		const getCollection = async () => {
			const [assignments, assessments] = await load();

			const CollectionImpl = isAdministrative
				? AssessmentCollectionInstructorView
				: AssessmentCollectionStudentView;

			this[LOADING].isResolved = true;
			return new CollectionImpl(
				service,
				this,
				assignments,
				assessments,
				getLink('AssignmentHistory'),
				this.GradeBook
			);
		};

		const refresh = async collection => {
			const data = await load();
			collection.applyData(...data);
			delete this[REFRESH];
		};

		const freshLoad = !this[LOADING];
		const maybeStale = !freshLoad && this[LOADING].isResolved;

		// cache the load promise so we don't re-enter the load...
		const collection = await (this[LOADING] ||
			(this[LOADING] = getCollection()));

		if (maybeStale && !this[REFRESH]) {
			this[REFRESH] = refresh(collection);
		}

		// wait on refreses in progress
		await this[REFRESH];

		return collection;
	}

	getAllAssignments() {
		return this.getAssignments().then(assignments =>
			assignments.getAssignments()
		);
	}

	getAssessment(ntiid) {
		return this.getAssignment(ntiid);
	}

	async getAssignment(ntiid) {
		const service = this[Service];
		const href = this.getLink('Assessments');
		// href will be something like this...
		//		/dataserver2/%2B%2Betc...site/Courses/Alpha/NTI%201000/@@Assessments
		//
		// we will want to append the ntiid to the end:
		//		/dataserver2/%2B%2Betc...site/Courses/Alpha/NTI%201000/@@Assessments/<ntiid>

		if (!href) {
			throw new Error(NO_LINK);
		}

		const assignemntParentRef = this; //the CourseInstance,
		//tho, probably should be the Assignemnts Collection but we may not have that...
		//the instance caches are on the service doc so we're covered there.

		const parseResult = o =>
			service.getObject(o, { parent: assignemntParentRef });
		const uri = Url.parse(href);

		uri.pathname = path.join(uri.pathname, encodeURIComponent(ntiid));

		const url = uri.format();

		return service.get(url).then(parseResult);
	}

	getAllSurveys(params) {
		const service = this[Service];
		const href = this.getLink('Inquiries');

		if (!href) {
			throw new Error('Survey request failed.');
		}

		return service.getBatch(href, {
			accept: 'application/vnd.nextthought.nasurvey',
			...params,
		});
	}

	async getInquiry(ntiid) {
		const service = this[Service];
		const href = this.getLink('CourseInquiries');

		if (!href) {
			throw new Error(NO_LINK);
		}

		const inquiryParentRef = this;

		const parseResult = o =>
			service.getObject(o, { parent: inquiryParentRef });
		const uri = Url.parse(href);

		uri.pathname = path.join(uri.pathname, encodeURIComponent(ntiid));

		const url = uri.format();

		return service.get(url).then(parseResult);
	}

	getAccessTokens() {
		if (!this.hasLink('CourseAccessTokens')) {
			return Promise.resolve();
		}

		const service = this[Service];
		const url = this.getLink('CourseAccessTokens');

		return service.getBatch(url).then(batch => batch && batch.Items);
	}

	getCourseDiscussions() {
		const service = this[Service];
		const url = this.getLink('CourseDiscussions');
		//For now make the course the parent.
		const discussionParentRef = this;
		const parseItem = o =>
			service.getObject(o, { parent: discussionParentRef });

		if (!url) {
			return Promise.resolve([]);
		}

		return service
			.get(url)
			.then(({ Items: items }) => Promise.all(items.map(parseItem)));
	}

	async getDiscussions(reloadBoard) {
		function logAndResume(reason) {
			if (reason !== NOT_DEFINED) {
				logger.warn('Could not load board: %o', reason);
			}
		}

		const contents = o =>
			o ? o.getContents() : Promise.reject(NOT_DEFINED);

		if (reloadBoard) {
			await this.Discussions.refresh();
			if (this.ParentDiscussions) {
				await this.ParentDiscussions.refresh();
			}
		}

		return Promise.all([
			contents(this.Discussions).catch(logAndResume),
			contents(this.ParentDiscussions).catch(logAndResume),
		]);
	}

	getForumType() {
		return Forum.MimeTypes[1];
	}

	hasDiscussions() {
		return !!(this.Discussions || this.ParentDiscussions);
	}

	hasCommunity() {
		return CourseCommunity.hasCommunity(this);
	}

	getCommunity() {
		if (!this[CourseCommunityCache]) {
			this[CourseCommunityCache] = CourseCommunity.from(this);
		}

		return this[CourseCommunityCache];
	}

	hasOutline() {
		return this.Outline && this.Outline.hasLink('contents');
	}

	/**
	 * Get the Outline for this course instance.
	 *
	 * @param {Object} [options] - An object of options
	 * @param {boolean} [options.force] - Force a new request, bypass & replace caches.
	 * @param {boolean} [options.unpublished] - include the unpublished nodes.
	 * @returns {Promise} fulfills with the outline, or rejects on error.
	 */
	getOutline(options) {
		const legacy = typeof options === 'boolean' && options; //backwards compatability
		const { force, unpublished = legacy } = options || {};

		const FIVE_MINUTES = 300000; //5min in milliseconds.
		const key = unpublished ? OutlineCacheUnpublished : OutlineCache;

		if (!this.Outline) {
			return Promise.resolve(new Outline(this[Service], this, {}));
		}

		if (!this[key] || force) {
			//We have to wait for the CCE to load to know if its in preview mode or not.
			this[key] = this.waitForPending().then(() =>
				//If we don't have an outline or the outline doesn't have a contents link
				!this.hasOutline()
					? Promise.reject('Preview')
					: //not preview, Load contents...
					  this.Outline.getContent(options)
			);
		}

		//Simple Promise wrapper... if the wrapped promise rejects, this will also reject.
		const p = (this[key] = Promise.resolve(this[key]));

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
	 * @param {Object} [options] - options to pass to getOutline().
	 * @returns {Promise} fulfills with outline node, or rejects if not found.
	 */
	getOutlineNode(id, options) {
		return this.getOutline(options).then(
			outline =>
				outline.getNode(id) || Promise.reject('Outline Node not found')
		);
	}

	getMediaIndex() {
		const MAX_AGE = 3600000; //One Hour

		let promise = this[MEDIA_INDEX];

		if (!promise || promise.stale) {
			const start = Date.now();

			promise = this[MEDIA_INDEX] = this.fetchLink(
				MEDIA_BY_OUTLINE_NODE
			).then(x =>
				MediaIndex.build(this[Service], this, x.ContainerOrder || [], x)
			);

			Object.defineProperty(promise, 'stale', {
				enumerable: false,
				get: () => Date.now() - start > MAX_AGE,
			});
		}

		return promise;
	}

	getVideoIndex() {
		if (!this.ContentPackageBundle) {
			return Promise.reject('No content bundle for this course instance');
		}

		function getForNode(node, index, output) {
			const id = node.getContentId();

			const scoped = id && index.scoped(id);

			if (scoped && scoped.length) {
				output.push(scoped);
			}

			const { contents } = node;
			if (contents && contents.length) {
				contents.forEach(n => getForNode(n, index, output));
			}
		}

		if (this.hasLink(MEDIA_BY_OUTLINE_NODE)) {
			return this.getMediaIndex().then(i =>
				i.filter(x => x && x.isVideo)
			);
		}

		return Promise.all([
			this.getOutline(),
			this.ContentPackageBundle.getVideoIndex(),
		]).then(([outline, index]) => {
			const slices = [];

			getForNode(outline, index, slices);

			return MediaIndex.combine(slices);
		});
	}

	resolveContentURL(url) {
		let bundle = this.ContentPackageBundle;
		let pkgs = bundle?.ContentPackages || []; //probably should search all packages...
		let pkg = pkgs.find(x => !x.isRenderable && x.root);

		let root = pkg && Url.parse(pkg.root);

		return Promise.resolve(root ? root.resolve(url) : url);
	}

	getDefaultShareWithValue(/*preferences*/) {
		let parentScopes = this.ParentSharingScopes;

		//see definition of defaultScope "getter"
		let { defaultScopeId, defaultScope } = this.SharingScopes || {};

		if (!defaultScope && parentScopes) {
			defaultScope = parentScopes.getScopeForId(defaultScopeId);
		}

		return Promise.resolve([defaultScope].filter(x => x));
	}

	async getDefaultSharing() {
		let parentScopes = this.ParentSharingScopes;

		//see definition of defaultScope "getter"
		let { defaultScopeId, defaultScope } = this.SharingScopes || {};

		if (!defaultScope && parentScopes) {
			defaultScope = parentScopes.getScopeForId(defaultScopeId);
		}

		return {
			scopes: [defaultScope].filter(Boolean),
		};
	}

	getSharingSuggestions() {
		const parent = this.parent();

		if (parent && parent.getSharingSuggestions) {
			return parent.getSharingSuggestions();
		}

		const getScope = (x, y) => x && x.getScope(y);
		let sectionScopes = this.SharingScopes;
		let parentScopes = this.ParentSharingScopes;

		let { defaultScope, defaultScopeId } = sectionScopes || {};

		let parentPublic = getScope(parentScopes || sectionScopes, 'Public');

		let suggestions = [];

		if (!defaultScope && parentScopes) {
			defaultScope = parentScopes.getScopeForId(defaultScopeId);
		}

		if (parentPublic) {
			let allStudents = Object.create(parentPublic, {
				generalName: { value: 'All Students' },
			});

			suggestions = [...suggestions, allStudents];
		}

		if (defaultScope && defaultScope !== parentPublic) {
			let classmates = Object.create(defaultScope, {
				generalName: { value: 'My Classmates' },
			});

			suggestions = [...suggestions, classmates];
		}

		return Promise.resolve(suggestions);
	}

	getContentDataSource() {
		return new ContentDataSource(this[Service], this);
	}

	getAllActivityDataSource() {
		const link = this.getLink('AllCourseActivity');

		return link
			? new CourseAllActivityDataSource(
					this[Service],
					this,
					{ sortOn: KnownActivitySorts },
					{ link }
			  )
			: null;
	}

	getParentActivityDataSource() {
		const link = this.getLink('ParentAllCourseActivity');

		return link
			? new CourseAllActivityDataSource(
					this[Service],
					this,
					{ sortOn: KnownActivitySorts },
					{ link }
			  )
			: null;
	}

	async getAvailableContentSummary() {
		const load = async () => {
			try {
				const { Items } = await this.fetchLink(
					'CourseContentLibrarySummary'
				);

				return Items.reduce((acc, i) => ({ ...acc, [i]: true }), {});
			} catch (e) {
				return {};
			}
		};

		this[AvailableContentSummary] = this[AvailableContentSummary] || load();

		setTimeout(() => {
			delete this[AvailableContentSummary];
		}, AvailableContentSummaryTimeout);

		return this[AvailableContentSummary];
	}

	async getContentTreeChildrenSource() {
		if (!this.hasOutline()) {
			return [];
		}

		try {
			const outline = await this.Outline.getContent({ force: true });

			return outline.contents;
		} catch (e) {
			return null;
		}
	}

	async getLTIConfiguredTools() {
		const configuredTools = await this.fetchLinkParsed(
			'lti-configured-tools'
		);
		return configuredTools;
	}

	getCatalogFamily() {
		return this.CatalogEntry && this.CatalogEntry.getCatalogFamily();
	}

	getCatalogFamilies() {
		return this.fetchLinkParsed('CourseCatalogFamilies');
	}
}

export default decorate(Instance, [
	model,
	mixin(CourseIdentity, ContentTreeMixin, HasEvaluations),
]);

//Private methods

async function resolvePreferredAccess(service, instance, parent) {
	const self = instance;
	try {
		const enrollment =
			parent instanceof Enrollment
				? parent
				: await self.fetchLinkParsed('UserCoursePreferredAccess');

		if (parent !== enrollment) {
			// For legacy compatability
			self.reparent(enrollment);
			// now the enrollment will have the instance as a parent since its who parsed it...
			// so set the instance's parent to our "parent" to fix the chain.
			enrollment.reparent(parent);
		}

		//legacy lookup path:
		self.CatalogEntry = enrollment.CatalogEntry;

		//new preferred property
		self.PreferredAccess = enrollment;

		enrollment.setCourseInstance(self);
	} catch (e) {
		self.reparent(null);
	}
}
