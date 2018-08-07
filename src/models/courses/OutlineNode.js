import url from 'url';

import {mixin} from '@nti/lib-decorators';
import {encodeForURI, isNTIID} from '@nti/lib-ntiids';
import Logger from '@nti/util-logger';

import {Summary, Parser as parse} from '../../constants';
import Publishable from '../../mixins/Publishable';
import {model, COMMON_PREFIX} from '../Registry';
import filterNonRequiredItems from '../../utils/filter-non-required-items';
import getFuzzyTargetProperty from '../../utils/get-fuzzy-target-property';

import Outline from './Outline';
import fallbackOverview from './_fallbacks.OverviewFromToC';

const logger = Logger.get('models:courses:OutlineNode');

export default
@model
@mixin(Publishable)
class OutlineNode extends Outline {
	static MimeType = [
		COMMON_PREFIX + 'courses.courseoutlinenode',
		COMMON_PREFIX + 'courses.courseoutlinecontentnode',
		COMMON_PREFIX + 'courses.courseoutlinecalendarnode',
	]

	static Fields = {
		...Outline.Fields,
		'contents':             { type: 'model[]', defaultValue: [] },
		'DCTitle':              { type: 'string'                    },
		'AvailableBeginning':   { type: 'date'                      },
		'AvailableEnding':      { type: 'date'                      },
		'ntiid':                { type: 'string'                    },
		'title':                { type: 'string'                    }
	}


	get label () { return this.DCTitle; }


	get ref () {
		let id = this.ContentNTIID;

		if (!id) {
			return undefined;
		}

		return encodeForURI(id);
	}


	get depth () {
		let type = super.constructor;
		return this.parents({test: p=>p instanceof type}).length;
	}


	get root () {
		let type = super.constructor;
		return this.parent({
			test: o=>o.constructor === type
		});
	}


	get isOpen () { return null; }


	get isLeaf () {
		return !this.contents || this.contents.length === 0;
	}


	get isHeading () { return null; }


	get isSection () { return null; }


	get isStaticOverContents () {
		return (/.+\.json/i).test(this.getLink('overview-content'));
	}

	/**
	 * Get the overview contents of this node.
	 * If no progress is required, pass an object with decorateProgress set to false to prevent decorating it.
	 *
	 * @method getContent
	 * @param  {Object} [params] optional paramaters
	 * @param  {Boolean} [params.requiredOnly] limit the items to only the required ones
	 * @param {Boolean} [params.decorateProgress] if false do not decorate the progress on the items
	 * @param {Boolean} [params.decorateSummary] if false do not decorate the summary call on the items
	 * @return {Promise} fulfills with the outlineNode's content or rejects with an error.
	 */
	async getContent ({requiredOnly = false, decorateProgress = true, decorateSummary = true} = {}) {
		const getContent = async () => {
			const isLegacy = Boolean(this.parent('isLegacy', true));
			const course = this.parent('isCourse', true);
			const link = 'overview-content';

			const fetchLink = async () => {
				let content = await this.fetchLink(link);
				if(this.isStaticOverContents) {
					content = fixRelativePaths(content, this.getLink(link));
					content.isStatic = true;
				}
				return isLegacy
					? collateVideo(content) //Has a Link, but is legacy
					: content;              //Has a Link, is NOT legacy
			};

			const fetchLegacy = () => {
				return isLegacy
					? getContentFallback(this) //no link, and is legacy
					: Promise.reject('empty'); //no link, and NOT legacy
			};

			const data = await (this.hasLink(link) ? fetchLink() : fetchLegacy());
			const assignments = !data.isStatic ? null : await course.getAssignments().catch(() => null);

			let content = !data.isStatic ? data : filterMissingAssignments(assignments, data);

			if (requiredOnly) {
				content = filterNonRequiredItems(data);
			}

			return this[parse](content);
		};

		try {
			const contentsPromise = getContent();

			if (decorateProgress) {
				Promise.all([ contentsPromise, this.getProgress() ]).then(applyProgress);
			}

			if (decorateSummary) {
				Promise.all([ contentsPromise, this.getSummary() ]).then(applySummary);
			}

			return await contentsPromise;
		} catch (e) {
			if (e === 'empty') {
				return {};
			}

			throw e;
		}
	}


	getProgress () {
		let link = 'Progress';

		if (!this.hasLink(link) || !this.isStaticOverContents) {
			return Promise.resolve(null);
		}

		return this.fetchLinkParsed(link);
	}


	getSummary () {
		let link = 'overview-summary';

		if (!this.hasLink(link)) {
			return Promise.resolve(null);
		}


		let accept = [
			'note'
		];

		return this.fetchLink(link, {
			// exclude: exclude.map(x=> 'application/vnd.nextthought.' + x).join(','),
			accept: accept.map(x=> 'application/vnd.nextthought.' + x).join(','),
			filter: 'TopLevel'
		});
	}
}


function applyProgress ([content, progress]) {
	if (!content || !progress) { return; }
	return applyStuff(content, (item, id) => {
		const node = (progress && progress.getProgress(id));
		if (node != null) {
			content.CompletedDate = node.getCompletedDate();
			//TODO: Add other fiedls as we need them
			content.onChange();
		}
	});
}


function applySummary ([content, summary]) {
	if (!content || !summary) { return content; }
	return applyStuff(content, (item) => {
		const commentCounts = summary || {};
		const node = commentCounts[item.getID()] || commentCounts[item['target-NTIID']] || commentCounts[item['Target-NTIID']];

		if (node != null) {
			item[Summary] = node || {ItemCount: 0};
			item.onChange();
		}
	});
}


function applyStuff (content, applier) {
	if (!content) { return; }

	const id = content[getFuzzyTargetProperty(content)];

	applier(content, id);

	if (Array.isArray(content.Items)) {
		content.Items.forEach(item => applyStuff(item, applier));
	}

	return content;
}


/**
 * Recursively remove assignments & references that are not included in the assignments collection
 *
 * @method filterMissingAssignments
 * @param  {Collection}             assignments The Assignments Collection instance.
 * @param  {object}                 item        The raw data for the overview contents of this outline node.
 * @return {object} The item but without assignments that cannot be resolved.
 */
function filterMissingAssignments (assignments, item) {
	function test (o) {
		const assignmentType = /assignment/i;
		const assessmentType = /(questionset|questionbank|assignment)/i;
		const id = o[getFuzzyTargetProperty(o)];
		const isLegacyAssignment = () => assessmentType.test(o.MimeType) && assignments && assignments.isAssignment(id);
		const isAssignment = assignmentType.test(o.MimeType) || isLegacyAssignment();

		return isAssignment
			? Boolean(assignments && assignments.getAssignment(id))
			: true;
	}

	const {Items: children} = item;

	if (children) {
		return {
			...item,
			Items: children.map(x => filterMissingAssignments(assignments, x)).filter(test)
		};
	}

	return item;
}


/**
 * Recursively fix items with relative href paths.
 *
 * @method fixRelativePaths
 * @param  {object}         item The content to fix.
 * @param  {string}         root The content root url to resolve against.
 * @return {object} Returns the item given. (potentially modified)
 */
function fixRelativePaths (item, root) {
	if (item && item.href && !isNTIID(item.href)) {
		item.href = url.resolve(root, item.href);
	}

	for (let x of (item.Items || [])) {
		fixRelativePaths(x, root);
	}

	return item;
}


/* *****************************************************************************
 * FALLBACK TEMPORARY STUFF BELOW THIS POINT
 */


function collateVideo (json) {
	const re = /ntivideo$/;
	const vroll = /videoroll$/;
	function collate (list, current) {
		let last = list[list.length - 1];
		if (re.test(current.MimeType)) {
			//last was a video...
			if (last && re.test(last.MimeType)) {
				last = list[list.length - 1] = {
					MimeType: 'application/vnd.nextthought.videoroll',
					Items: [last]
				};
			}

			//The previous item is a video set...(or we just created it)
			if (last && vroll.test(last.MimeType)) {
				last.Items.push(current);
				return list;
			}

		} else if (current.Items && !vroll.test(current.MimeType)) {
			current = collateVideo(current);
		}

		list.push(current);
		return list;
	}

	return {
		...json,
		Items: (json.Items || []).reduce(collate, [])
	};
}



async function getContentFallback (outlineNode) {
	logger.debug('[FALLBACK] Deriving OutlineNode(%s) content', outlineNode.getContentId());
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
	}
	else {
		logger.error('Fallback Content failed');
	}

	return content;
}
