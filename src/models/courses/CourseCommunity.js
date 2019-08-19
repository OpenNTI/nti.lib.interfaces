import {Channels} from '../community';

const ContentsCache = new Map();

export default
class CourseCommunity {
	static hasCommunity (course) {
		return course.Discussions || course.ParentDiscussions;
	}

	static from (course) {
		if (!course.Discussions && !course.ParentDiscussions) { return null; }

		return new CourseCommunity(course);
	}

	#course = null
	#board = null
	#parentBoard = null

	constructor (course) {
		this.#course = course;
		
		this.#board = course.Discussions || course.ParentDiscussions;
		this.#parentBoard = course.Discussions ? course.ParentDiscussions : null;
	}


	get displayName () {
		return this.#board.title;
	}


	get about () {
		return this.#board.description;
	}

	canEdit () {
		return this.#board.hasLink('edit');
	}

	save () {
		//TODO: fill this in
	}


	async getChannelList () {
		try {
			const showParent = await shouldShowParentBoard(this.#parentBoard);

			if (showParent) {
				return Promise.all([
					getChannelListFromBoard(this.#board, this.#course.getLink('activity'), 'my section'),
					getChannelListFromBoard(this.#parentBoard, this.#course.getLink('parent-activity'), 'parent section')
				]);
			}

			return getChannelListFromBoard(this.#board, this.#course.getLink('activity'));
		} finally {
			cleanup(this.#parentBoard);
			cleanup(this.#board);
		}
	}
}

function cleanup (board) {
	ContentsCache.delete(board);
}

function getBoardContents (board) {
	if (!ContentsCache.has(board)) {
		ContentsCache.set(board, board.getContents());
	}

	return ContentsCache.get(board);
}

function buildAllActivityChannel (forum, activityLink) {

}

/**
 * determine if we need to show the parent board's discussions.
 *
 * We show the parent board if:
 * 1.) it exists
 * --AND--
 * 2.a) it has a non-default forum
 * --OR--
 * 2.b) the default forum has a topic
 *
 * @param  {Board} parentBoard the ParentDiscussions of the course
 * @return {Boolean}             [description]
 */
async function shouldShowParentBoard (parentBoard) {
	if (!parentBoard) { return false; }
	if (parentBoard.ForumCount > 1) { return true; }

	try {
		const {Items} = await getBoardContents(parentBoard);
		const defaultForum = Items && Items[0];

		return defaultForum && defaultForum.TopicCount > 0;
	} catch (e) {
		return false;
	}
}

async function getChannelListFromBoard (board, activityLink, label) {
	const contents = await getBoardContents(board);
	const channels = (contents.Items || []).map((forum) => {
		if (forum.isDefaultForum) { return buildAllActivityChannel(forum, activityLink); }

		return Channels.Channel.fromForum(forum);
	});

	const createChannel = board.canCreateForum() ?
		(title) => board.createForum({title}) :
		null;

	return new Channels.List({id: board.getID(), label, channels, createChannel});
}
