import {url} from 'url';

import {applyIf} from 'nti-commons';
import {mixin} from 'nti-lib-decorators';
import {encodeForURI} from 'nti-lib-ntiids';
import Logger from 'nti-util-logger';

import {Summary, Parser as parse} from '../../constants';
import Publishable from '../../mixins/Publishable';
import {model, COMMON_PREFIX} from '../Registry';
import filterNonRequiredItems from '../../utils/filter-non-required-items';

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


	get isOpen () {}


	get isLeaf () {
		return !this.contents || this.contents.length === 0;
	}


	get isHeading () {}


	get isSection () {}


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
	 * @return {Promise} fulfills with the outlineNode's content or rejects with an error.
	 */
	async getContent ({requiredOnly = false} = {}) {
		const getContent = async () => {
			const isLegacy = Boolean(this.parent('isLegacy', true));
			const course = this.parent('isCourse', true);
			const link = 'overview-content';

			const fetchLink = async () => {
				let content = await this.fetchLink(link);
				if(this.isStaticOverContents) {
					content = fixRelativePaths(content, this.getLink(link));
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

			const [assignments, data] = await Promise.all([
				course.getAssignments().catch(() => null),
				(this.hasLink(link)
					? fetchLink()
					: fetchLegacy()
				)
			]);

			let content = filterMissingAssignments(assignments, data);

			if (requiredOnly) {
				content = filterNonRequiredItems(data);
			}

			return this[parse](content);
		};

		try {
			return applyProgressAndSummary(...(await Promise.all([
				getContent(),
				this.getProgress(),
				this.getSummary(),
			])));
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



/**
 * Finds the NTIID field on the given object.
 *
 * @method getFuzzyID
 * @param  {object}         object                               The object to find an ID for.
 * @param  {Array<string>}  [keys=['Target-NTIID', 'NTIID']]     The possible ID fields.
 * @return {string}         The key name, or undefined.
 */
function getFuzzyID (object, keys = ['Target-NTIID', 'NTIID']) {
	const objectKeys = Object.keys(object);

	//We sadly have used inconsistent cassings of Target-NTIID, and NTIID.
	//Some are lowercase, some are capped, some are mixed.
	return keys.find(key => (
		key = key.toLowerCase(),
		objectKeys.find(v => v.toLowerCase() === key)));
}


function applyProgressAndSummary (content, progress, summary) {
	if (!content) { return; }

	function findWithFuzzyKey (c, key) {
		key = key.toLowerCase();
		key = Object.keys(c).reduce(
			(found, v)=> found || (v.toLowerCase() === key ? v : found),
			null);

		return key && c[key];
	}

	let [nodeProgress, summaryData] = ['Target-NTIID', 'NTIID']
		//We sadly have used inconsistent cassings of Target-NTIID, and NTIID.
		//Some are lowercase, some are capped, some are mixed.
		//Step 1: Find the VALUE of each "fuzzy" key. (eg: Lower case the keys and find a first-match.)
		.map(key=> findWithFuzzyKey(content, key))

		//Now that we (may) have the IDs for each key to test, we need to look up the progress and
		//summary data for each id... returning a tuple of the potential data.
		//Step 2: Build a tuple of the shape: [progress, summary]
		.map(id=> id && [(progress && progress.getProgress(id)), (summary || {})[id]])

		//Now the array of potentials is a list of tuples. We need to reduce this down to one tuple.
		//Step 3: Reduce the posible keys results down to one tuple, by applying each result on top
		//of each other. 99% of the time we expect the list of tuples to be all in one element, or
		//spread out over the elements such that each part of the tuple never overlaps. ... for the
		// case that two or more elements in the array have a tuple that has a populated part that
		// overlaps, we will accept the first one and drop all supsequent ones.
		// Ex:  [
		// 		[Progress, ],
		// 		[, Summary]
		// ]
		//
		// or [
		// 		[, Summary],
		// 		[Progress, ]
		// ]
		//
		// or [
		// 		[Progress, Summary],
		// 		[,]
		// ]
		//
		// or [
		// 		[,]
		// 		[Progress, Summary]
		// ]
		//
		// The result should be a single tuple [Progress, Summary]
		.reduce((r, x) => applyIf(r || [], x || []));

	if (nodeProgress != null) {
		content.CompletedDate = nodeProgress.getCompletedDate();
		//TODO: Add other fiedls as we need them
	}

	if (summary != null) {
		content[Summary] = summaryData || {ItemCount: 0};
	}

	if (Array.isArray(content.Items)) {
		content.Items.forEach(item=>applyProgressAndSummary(item, progress, summary));
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
		const id = o[getFuzzyID(o)];
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
	if (item && item.href) {
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



function getContentFallback (outlineNode) {
	logger.debug('[FALLBACK] Deriving OutlineNode(%s) content', outlineNode.getContentId());
	const getCourse = node => node.root.parent();
	const course = getCourse(outlineNode);
	const bundle = course && course.ContentPackageBundle;
	const pkg = ((bundle && bundle.ContentPackages) || [])[0];
	const contentId = outlineNode.getContentId();

	const p = pkg ? pkg.getTableOfContents() : Promise.reject('No Content Package');

	return p.then(function (toc) {
		const tocNode = toc.getNode(contentId);
		const content = tocNode && fallbackOverview(tocNode, outlineNode);
		if (!content) {
			logger.error('Fallback Content failed');
		}
		return content;
	});
}
