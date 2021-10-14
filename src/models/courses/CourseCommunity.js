import AbstractCommunity from '../AbstractCommunity.js';
import { Channels } from '../community/index.js';
import { AutoSubscribable, Avatar, HasMembers } from '../community/traits.js';

const ContentsCache = new Map();

export default class CourseCommunity extends AutoSubscribable(
	false,
	HasMembers(false, Avatar(false, AbstractCommunity))
) {
	static hasCommunity(course) {
		return course.Discussions || course.ParentDiscussions;
	}

	static from(course) {
		if (!course.Discussions && !course.ParentDiscussions) {
			return null;
		}

		return new CourseCommunity(course);
	}

	#course = null;
	#board = null;
	#parentBoard = null;

	constructor(course) {
		super();

		this.#course = course;

		this.#board = course.Discussions || course.ParentDiscussions;
		this.#parentBoard = course.Discussions
			? course.ParentDiscussions
			: null;
	}

	getID() {
		return this.#course.getID();
	}

	get isCourseCommunity() {
		return true;
	}

	get courseId() {
		return this.#course.getID();
	}

	get displayName() {
		return this.#board.title;
	}

	get about() {
		return this.#board.description;
	}

	get isModifiable() {
		return this.#board.hasLink('edit');
	}

	canEdit() {
		return this.isModifiable;
	}

	async save(data) {
		const payload = {};

		if (Object.hasOwnProperty.call(data, 'displayName')) {
			payload.title = data.displayName;
		}
		if (Object.hasOwnProperty.call(data, 'about')) {
			payload.description = data.about || '';
		}

		try {
			await this.#board.save(payload);
			this.onChange();
		} catch (e) {
			if (e.field === 'title') {
				e.field = 'displayName';
			}

			throw e;
		}
	}

	async [AbstractCommunity.ResolveChannelList]() {
		try {
			const showParent = await shouldShowParentBoard(this.#parentBoard);

			if (showParent) {
				return Promise.all([
					getChannelListFromBoard(
						this.#parentBoard,
						getAllParentActivityInfo(this.#course),
						'Public'
					), //gross, but we can't localize this string easily right now
					getChannelListFromBoard(
						this.#board,
						getAllActivityInfo(this.#course),
						this.#course.ProviderUniqueID
					),
				]);
			}

			return getChannelListFromBoard(
				this.#board,
				getAllActivityInfo(this.#course)
			);
		} finally {
			cleanup(this.#parentBoard);
			cleanup(this.#board);
		}
	}

	async getDefaultSharing() {
		const sharing = await this.#course.getDefaultSharing();

		return {
			scopes: sharing?.scopes ?? [],
			locked: true,
		};
	}
}

function cleanup(board) {
	ContentsCache.delete(board);
}

function getBoardContents(board) {
	if (!ContentsCache.has(board)) {
		ContentsCache.set(board, board.getContents());
	}

	return ContentsCache.get(board);
}

function getAllParentActivityInfo(course) {
	return {
		dataSource: course.getParentActivityDataSource(),
		title: course.getLinkProperty('ParentAllCourseActivity', 'title'),
	};
}

function getAllActivityInfo(course) {
	return {
		dataSource: course.getAllActivityDataSource(),
		title: course.getLinkProperty('AllCourseActivity', 'title'),
	};
}

function buildAllActivityChannel(forum, activityInfo) {
	const addDiscussion = forum.canCreateTopic()
		? topic => forum.createTopic(topic)
		: null;

	const channel = new Channels.Channel({
		backer: forum,
		id: forum.getID(),
		title: activityInfo.title,
		contentsDataSource: activityInfo.dataSource,
		setTitle: null,
		pinned: true,
		addDiscussion,
		DefaultSharedToNTIIDs: forum.DefaultSharedToNTIIDs,
		DefaultSharedToDisplayNames: forum.DefaultSharedToDisplayNames,
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
 * @returns {boolean}             [description]
 */
async function shouldShowParentBoard(parentBoard) {
	if (!parentBoard) {
		return false;
	}
	if (parentBoard.ForumCount > 1) {
		return true;
	}

	try {
		const { Items } = await getBoardContents(parentBoard);
		const defaultForum = Items && Items[0];

		return defaultForum && defaultForum.TopicCount > 0;
	} catch (e) {
		return false;
	}
}

async function getChannelListFromBoard(board, activityDataSource, label) {
	const channelList = await Channels.List.fromBoard(board, label, forum =>
		buildAllActivityChannel(forum, activityDataSource)
	);

	return channelList;
}
