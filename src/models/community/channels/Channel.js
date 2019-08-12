import EventEmitter from 'events';

export default class CommunityChannel extends EventEmitter {
	static fromForum (forum) {
		const setTitle = forum.isModifiable ?
			(title) => forum.save({title}) :
			null;

		const addTopic = forum.canCreateTopic() ?
			(topic) => forum.createTopic(topic) :
			null;

		return new CommunityChannel({
			title: forum.title,
			contentsDataSource: forum.getContentsDataSource(),
			setTitle,
			addTopic,
		});
	}

	#title = null
	#setTitle = null
	#contentsDataSource = null
	#addTopic = null

	constructor ({title, setTitle, contentsDataSource, addTopic}) {
		super();

		this.#title = title;
		this.#setTitle = setTitle;
		this.#contentsDataSource = contentsDataSource;
		this.#addTopic = addTopic;
	}

	get title () { return this.#title; }

	get canSetTitle () { return !!this.#setTitle; }
	async setTitle (title) {
		if (!this.canSetTitle) { throw new Error('Cannot set title on channel'); }

		const newTitle = await this.#setTitle(title);

		this.#title = newTitle || title;
		this.emit('change');

		return newTitle || title;
	}

	get contentsDataSource () { return this.#contentsDataSource; }

	get canAddTopic () { return !!this.addTopic; }
	async addTopic (topic) {
		if (!this.canAddTopic) { throw new Error('Cannot add topic to channel'); }

		const newTopic = await this.#addTopic(topic);

		this.emit('topic-added');

		return newTopic;
	}

}