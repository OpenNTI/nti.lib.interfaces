import url from 'url';

import { encodeForURI, isNTIID } from '@nti/lib-ntiids';
import Logger from '@nti/util-logger';

import {
	Summary,
	Parser as parse,
	SCOPED_COURSE_INSTANCE,
} from '../../constants.js';
import { Mixin as ContentTree } from '../../content-tree/index.js';
import Publishable from '../../mixins/Publishable.js';
import ContentConstraints from '../../mixins/ContentConstraints.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';
import filterNonRequiredItems from '../../utils/filter-non-required-items.js';
import getFuzzyTargetProperty from '../../utils/get-fuzzy-target-property.js';

import Outline from './Outline.js';
import fallbackOverview from './_fallbacks.OverviewFromToC.js';

const logger = Logger.get('models:courses:OutlineNode');

export default class OutlineNode extends Publishable(
	ContentTree(ContentConstraints(Outline))
) {
	static MimeType = [
		COMMON_PREFIX + 'courses.courseoutlinenode',
		COMMON_PREFIX + 'courses.courseoutlinecontentnode',
		COMMON_PREFIX + 'courses.courseoutlinecalendarnode',
	];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'contents':             { type: 'model[]', defaultValue: [] },
		'DCTitle':              { type: 'string'                    },
		'AvailableBeginning':   { type: 'date'                      },
		'AvailableEnding':      { type: 'date'                      },
		'LessonOverviewNTIID':  { type: 'string'                    },
		'PublicationState':     { type: '*'                         },
		'ntiid':                { type: 'string'                    },
		'title':                { type: 'string'                    }
	}

	isOutlineNode = true;

	hasMetContentConstraints() {
		return this.hasOverviewContent;
	}

	get hasOverviewContent() {
		return this.hasLink('overview-content');
	}

	get label() {
		return this.DCTitle;
	}

	get ref() {
		let id = this.ContentNTIID;

		if (!id) {
			return undefined;
		}

		return encodeForURI(id);
	}

	get depth() {
		return this.parents({ test: p => p instanceof Outline }).length;
	}

	get root() {
		return this.parent({
			test: o => o.constructor === Outline,
		});
	}

	get isOpen() {
		return null;
	}

	get isLeaf() {
		return !this.contents || this.contents.length === 0;
	}

	get isHeading() {
		return null;
	}

	get isSection() {
		return null;
	}

	get isStaticOverContents() {
		return /.+\.json/i.test(this.getLink('overview-content'));
	}

	/**
	 * Get the overview contents of this node.
	 * If no progress is required, pass an object with decorateProgress set to false to prevent decorating it.
	 *
	 * @function getContent
	 * @param  {Object} [params] optional parameters
	 * @param  {boolean} [params.requiredOnly] limit the items to only the required ones
	 * @param {boolean} [params.decorateProgress] if false do not decorate the progress on the items
	 * @param {boolean} [params.decorateSummary] if false do not decorate the summary call on the items
	 * @returns {Promise} fulfills with the outlineNode's content or rejects with an error.
	 */
	async getContent({
		requiredOnly = false,
		decorateProgress = true,
		decorateSummary = true,
	} = {}) {
		const getContent = async () => {
			const isLegacy = Boolean(this.parent('isLegacy', true));
			const course = this.parent('isCourse', true);
			const link = 'overview-content';

			const fetchLink = async () => {
				let content = await this.fetchLink(link);

				if (typeof content !== 'object') {
					throw new TypeError(
						`Expected JSON, received ${typeof content}`
					);
				}

				if (this.isStaticOverContents) {
					content = fixRelativePaths(content, this.getLink(link));
					content.isStatic = true;
				}
				return isLegacy
					? collateVideo(content) //Has a Link, but is legacy
					: content; //Has a Link, is NOT legacy
			};

			const fetchLegacy = () => {
				return isLegacy
					? getContentFallback(this) //no link, and is legacy
					: Promise.reject('empty'); //no link, and NOT legacy
			};

			const data = await (this.hasLink(link)
				? fetchLink()
				: fetchLegacy());
			const assignments = !data.isStatic
				? null
				: await course.getAssignments().catch(() => null);

			let content = !data.isStatic
				? data
				: filterMissingAssignments(assignments, data);

			if (requiredOnly) {
				content = filterNonRequiredItems(data);
			}

			const scope = this.parent(x => x[SCOPED_COURSE_INSTANCE]);
			const enrollment = scope?.parent(x =>
				x.hasLink('UserLessonCompletionStatsByOutlineNode')
			);

			if (enrollment?.isForAppUser === false) {
				await applyContentsOverlayWithUserCompletionStats(
					content,
					enrollment
				);
			}

			const parsed = this[parse](content);
			return parsed && parsed.waitForPending();
		};

		try {
			const contentsPromise = getContent();

			if (decorateProgress) {
				Promise.all([contentsPromise, this.getProgress()]).then(
					applyProgress
				);
			}

			if (decorateSummary) {
				Promise.all([contentsPromise, this.getSummary()]).then(
					applySummary
				);
			}

			return await contentsPromise;
		} catch (e) {
			if (e === 'empty') {
				return {};
			}

			throw e;
		}
	}

	getProgress() {
		let link = 'Progress';

		if (!this.hasLink(link) || !this.isStaticOverContents) {
			return Promise.resolve(null);
		}

		return this.fetchLinkParsed(link);
	}

	getSummary() {
		let link = 'overview-summary';

		if (!this.hasLink(link)) {
			return Promise.resolve(null);
		}

		let accept = ['note'];

		return this.fetchLink(link, {
			// exclude: exclude.map(x=> 'application/vnd.nextthought.' + x).join(','),
			accept: accept
				.map(x => 'application/vnd.nextthought.' + x)
				.join(','),
			filter: 'TopLevel',
		});
	}

	async getContentTreeChildrenSource() {
		if (!this.hasLink('overview-content')) {
			return this.contents;
		}

		try {
			const contents = await this.getContent();

			return contents;
		} catch (e) {
			return null;
		}
	}
}

Registry.register(OutlineNode);

function applyProgress([content, progress]) {
	if (!content || !progress) {
		return;
	}
	return walk(content, (item, id) => {
		const node = progress && progress.getProgress(id);
		if (node != null) {
			content.CompletedDate = node.getCompletedDate();
			//TODO: Add other fields as we need them
			content.onChange();
		}
	});
}

function applySummary([content, summary]) {
	if (!content || !summary) {
		return content;
	}
	return walk(content, (item, id) => {
		const commentCounts = summary || {};
		const node = commentCounts[item.getID()] || commentCounts[id];

		if (node != null) {
			item[Summary] = node || { ItemCount: 0 };
			item.onChange();
		}
	});
}

function walk(site, visit) {
	if (site) {
		visit(site, site?.[getFuzzyTargetProperty(site)]);
	}
	for (const item of site?.Items || []) {
		walk(item, visit);
	}
	return site;
}

async function applyContentsOverlayWithUserCompletionStats(
	rawContent,
	enrollment
) {
	const pluckItems = o =>
		[
			'SuccessfulItems',
			'UnSuccessfulItems',
			'UnrequiredSuccessfulItems',
			'UnrequiredUnSuccessfulItems',
		].reduce((_, k) => _.concat(o[k] || []), []);

	const { Outline: o, Assignments } = await enrollment.fetchLink(
		'UserLessonCompletionStatsByOutlineNode'
	);
	const outline = o
		.reduce((_, i) => [..._, ...Object.values(i)], [])
		.flat()
		.find(x => x.LessonNTIID === rawContent.NTIID);
	const completionItems = [outline, Assignments]
		.map(pluckItems)
		.flat()
		.reduce((acc, i) => ((acc[i.ItemNTIID] = i), acc), {});

	walk(rawContent, (item, id) => {
		item.CompletedItem = completionItems[id];
		logger.debug(
			'Overlaying UserCompletionStats: MimeType: %s, id: %s, applying completion item: %o',
			item?.MimeType,
			id,
			item.CompletedItem
		);
	});
}

/**
 * Recursively remove assignments & references that are not included in the assignments collection
 *
 * @function filterMissingAssignments
 * @param  {Collection}             assignments The Assignments Collection instance.
 * @param  {Object}                 item        The raw data for the overview contents of this outline node.
 * @returns {Object} The item but without assignments that cannot be resolved.
 */
function filterMissingAssignments(assignments, item) {
	function test(o) {
		const assignmentType = /assignment/i;
		const assessmentType = /(questionset|questionbank|assignment)/i;
		const id = o[getFuzzyTargetProperty(o)];
		const isLegacyAssignment = () =>
			assessmentType.test(o.MimeType) &&
			assignments &&
			assignments.isAssignment(id);
		const isAssignment =
			assignmentType.test(o.MimeType) || isLegacyAssignment();

		return isAssignment
			? Boolean(assignments && assignments.getAssignment(id))
			: true;
	}

	const { Items: children } = item;

	if (children) {
		return {
			...item,
			Items: children
				.map(x => filterMissingAssignments(assignments, x))
				.filter(test),
		};
	}

	return item;
}

/**
 * Recursively fix items with relative href paths.
 *
 * @function fixRelativePaths
 * @param  {Object}         item The content to fix.
 * @param  {string}         root The content root url to resolve against.
 * @returns {Object} Returns the item given. (potentially modified)
 */
function fixRelativePaths(item, root) {
	if (item && item.href && !isNTIID(item.href)) {
		item.href = url.resolve(root, item.href);
	}

	for (let x of item.Items || []) {
		fixRelativePaths(x, root);
	}

	return item;
}

/* *****************************************************************************
 * FALLBACK TEMPORARY STUFF BELOW THIS POINT
 */

function collateVideo(json) {
	const re = /ntivideo$/;
	const videoRoll = /videoroll$/;
	function collate(list, current) {
		let last = list[list.length - 1];
		if (re.test(current.MimeType)) {
			//last was a video...
			if (last && re.test(last.MimeType)) {
				last = list[list.length - 1] = {
					MimeType: 'application/vnd.nextthought.videoroll',
					Items: [last],
				};
			}

			//The previous item is a video set...(or we just created it)
			if (last && videoRoll.test(last.MimeType)) {
				last.Items.push(current);
				return list;
			}
		} else if (current.Items && !videoRoll.test(current.MimeType)) {
			current = collateVideo(current);
		}

		list.push(current);
		return list;
	}

	return {
		...json,
		Items: (json.Items || []).reduce(collate, []),
	};
}

async function getContentFallback(outlineNode) {
	logger.debug(
		'[FALLBACK] Deriving OutlineNode(%s) content',
		outlineNode.getContentId()
	);
	const getCourse = node => node.root.parent();
	const course = getCourse(outlineNode);
	const bundle = course && course.ContentPackageBundle;
	const pkg = ((bundle && bundle.ContentPackages) || [])[0];
	const contentId = outlineNode.getContentId();

	if (!pkg) {
		throw new Error('No Content Package');
	}

	const toc = await pkg.getTableOfContents();

	const tocNode = toc.getNode(contentId);
	const content = tocNode && fallbackOverview(tocNode, outlineNode);

	if (content) {
		content.isStatic = true;
	} else {
		logger.error('Fallback Content failed');
	}

	return content;
}
