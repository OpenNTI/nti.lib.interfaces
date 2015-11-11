import Outline from './Outline';
import {Progress, Summary, DateFields, Parser as parse} from '../../CommonSymbols';

import fallbackOverview from './_fallbacks.OverviewFromToC';

import applyIf from '../../utils/applyif';
import {encodeForURI} from '../../utils/ntiids';

export default class OutlineNode extends Outline {
	constructor (service, parent, data) {
		super(service, parent, data);
		let p = c=>c.map(o => this[parse](o));
		this.contents = p(data.contents || []);
	}

	[DateFields] () {
		return super[DateFields]().concat([
			'AvailableBeginning',
			'AvailableEnding'
		]);
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
		let link = 'overview-content';
		let getContent = (this.hasLink(link) ?
			this.fetchLink(link).then(collateVideo) :
			getContentFallback(this))
				.then(raw => this[parse](raw));

		return Promise.all([this.getProgress(), this.getSummary(), getContent])
			.then(progressAndContent=> {
				let [progress, summary, content] = progressAndContent;

				applyProgressAndSummary(content, progress, summary);

				return content;
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


function collateVideo (json) {
	let re = /ntivideo$/;
	function collate (list, current) {
		let last = list[list.length - 1];
		if (re.test(current.MimeType)) {
			//last was a video...
			if (last && re.test(last.MimeType)) {
				last = list[list.length - 1] = {
					MimeType: 'application/vnd.nextthought.ntivideoset',
					Items: [last]
				};
			}

			//The previous item is a video set...(or we just created it)
			if (last && /ntivideoset$/.test(last.MimeType)) {
				last.Items.push(current);
				return list;
			}

		} else if (current.Items) {
			current = collateVideo(current);
		}

		list.push(current);
		return list;
	}

	json.Items = json.Items.reduce(collate, []);

	return json;
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


function getContentFallback (outlineNode) {
	console.debug('[FALLBACK] Deriving OutlineNode(%s) content', outlineNode.ContentNTIID);
	const getCourse = node => node.root.parent();
	const course = getCourse(outlineNode);
	const bundle = course && course.ContentPackageBundle;
	const pkg = ((bundle && bundle.ContentPackages) || [])[0];
	const contentId = outlineNode.ContentNTIID;

	const p = pkg ? pkg.getTableOfContents() : Promise.reject('No Content Package');

	return p.then(function (toc) {
		const tocNode = toc.getNode(contentId);
		const content = fallbackOverview(tocNode, outlineNode);
		if (!content) {
			console.error('Fallback Content failed');
		}
		return content;
	});
}
