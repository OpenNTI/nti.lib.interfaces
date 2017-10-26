import {applyIf} from 'nti-commons';
import {mixin} from 'nti-lib-decorators';
import {encodeForURI} from 'nti-lib-ntiids';
import Logger from 'nti-util-logger';

import {Progress, Summary, Parser as parse} from '../../constants';
import Publishable from '../../mixins/Publishable';
import {model, COMMON_PREFIX} from '../Registry';

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


	getContent () {
		const isLegacy = Boolean(this.parent('isLegacy', true));
		const link = 'overview-content';

		let doFetch = (
			this.hasLink(link)
				//Has the link:
				? this.fetchLink(link)
					.then(content => //link fetched...stored in "content" argument.

						isLegacy //Next question: is this course legacy?

							? collateVideo(content)	//Has Link, but is legacy

							: content				//Has Link, is NOT legacy
					)

				//Does NOT have the link:
				: isLegacy	//Next question: is this course legacy?

					? getContentFallback(this)	//no link, and isLegacy

					: Promise.reject('empty')	//no link, and NOT isLegacy
		)

			//contents fetched or derived, now parse.
			.then(raw => this[parse](raw));

		return Promise.all([this.getProgress(), this.getSummary(), doFetch])
			.then(progressAndContent=> {
				let [progress, summary, content] = progressAndContent;

				applyProgressAndSummary(content, progress, summary);

				return content;
			})
			.catch(e => {

				if (e === 'empty') {
					return {};
				}

				return Promise.reject(e);
			});
	}


	getProgress () {
		let link = 'Progress';

		if (!this.hasLink(link)) {
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
		content[Progress] = nodeProgress;
	}

	if (summary != null) {
		content[Summary] = summaryData || {ItemCount: 0};
	}

	if (Array.isArray(content.Items)) {
		content.Items.forEach(item=>applyProgressAndSummary(item, progress, summary));
	}
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
