import EventEmitter from 'events';

import {Channels} from '../community';

const ContentsCache = new Map();
const ResolveChannelList = Symbol('Resolve Channel List');

export default
class CourseCommunity extends EventEmitter {
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
	#channelListPromise = null

	constructor (course) {
		super();

		this.#course = course;
		
		this.#board = course.Discussions || course.ParentDiscussions;
		this.#parentBoard = course.Discussions ? course.ParentDiscussions : null;
	}

	isCommunity = true

	getID () { return this.#course.getID(); }

	get displayName () {
		return this.#board.title;
	}


	get about () {
		return this.#board.description;
	}

	canEdit () {
		return this.#board.hasLink('edit');
	}

	async save (data) {
		const payload = {};

		if (data.displayName != null) {payload.title = data.displayName; }
		if (data.about != null) {payload.description = data.about; }

		try {
			await this.#board.save(payload);
			this.onChange();
		} catch (e) {
			if (e.field === 'title') { e.field = 'displayName'; }
		
			throw e;
		}
	}

	onChange () {
		this.emit('change');
	}

	[ResolveChannelList] = async () => {
		try {
			const showParent = await shouldShowParentBoard(this.#parentBoard);

			if (showParent) {

				return Promise.all([
					getChannelListFromBoard(this.#board, getAllActivityInfo(this.#course), 'my section'),
					getChannelListFromBoard(this.#parentBoard, getAllParentActivityInfo(this.#course), 'parent section')
				]);
			}

			return getChannelListFromBoard(this.#board, getAllActivityInfo(this.#course));
		} finally {
			cleanup(this.#parentBoard);
			cleanup(this.#board);
		}
	}

	async getChannelList () {
		if (!this.#channelListPromise) {
			this.#channelListPromise = this[ResolveChannelList]();
		}

		return this.#channelListPromise;
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

function getAllParentActivityInfo (course) {
	return {
		dataSource: course.getAllActivityDataSource(),
		title: course.getLinkProperty('ParentAllCourseActivity', 'title'),
		id: course.getLinkProperty('ParentAllCourseActivity', 'ntiid')
	};
}

function getAllActivityInfo (course) {
	return {
		dataSource: course.getAllActivityDataSource(),
		title: course.getLinkProperty('AllCourseActivity', 'title'),
		id: course.getLinkProperty('AllCourseActivity', 'ntiid')
	};
}

function buildAllActivityChannel (forum, activityInfo) {
	const addTopic = forum.canCreateTopic() ?
		(topic) => forum.createTopic(topic) :
		null;

	const channel = new Channels.Channel({
		backer: forum,
		id: activityInfo.id,
		title: activityInfo.title,
		contentsDataSource:activityInfo.dataSource,
		setTitle: null,
		pinned: true,
		addTopic
	});

	return channel;
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

async function getChannelListFromBoard (board, activityDataSource, label) {
	const contents = await getBoardContents(board);
	const channels = (contents.Items || []).reduce((acc, forum) => {
		if (forum.IsDefaultForum && activityDataSource) {
			return [buildAllActivityChannel(forum, activityDataSource), ...acc];
		}

		return [...acc, Channels.Channel.fromForum(forum)];
	}, []);

	const setOrder = board.isModifiable ?
		async (order) => {
			await board.save({'ordered_keys': order});
			return board.orderedKeys;
		} :
		null;

	const createChannel = board.canCreateForum() ?
		async (data) => {
			const forum = await board.createForum(data);

			return Channels.Channel.fromForum(forum);
		} :
		null;

	return new Channels.List({id: board.getID(), label, channels, createChannel, setOrder});
}
