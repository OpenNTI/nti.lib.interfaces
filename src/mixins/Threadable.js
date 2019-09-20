import {ntiidEquals} from '@nti/lib-ntiids';
import Logger from '@nti/util-logger';

import {DELETED, Parser} from '../constants';
import {thread, CHILDREN, PARENT} from '../utils/UserDataThreader';

const logger = Logger.get('models:mixins:Threadable');

export default {
	isThreadable: true,

	initMixin () {
		this.on('change', (_, what)=> {
			if (what === DELETED) {
				this.refresh({
					NTIID: this.getID(),
					Creator: '',
					body: ['This message has been deleted.'],
					phantom: void 0,
					placeholder: true
				});

				if (this.isLeaf()) {
					//Remove refs
					const parent = this[PARENT];
					const parentRefs = (parent || {})[CHILDREN];

					if (parentRefs && parent) {
						const ix = parentRefs.indexOf(this);
						if (ix < 0) {
							logger.warn('Could not find reference in parent children list');
							return;
						}

						parentRefs.splice(ix, 1);

						if (!parent.placeholder) {
							try {
								delete parent.ReferencedByCount;
								Object.defineProperty(parent, 'ReferencedByCount', {value: parent.ReferencedByCount - 1});
							} catch (e) {
								logger.warn(e.stack || e.message || e);
							}
						}

						parent.onChange('child deleted');
						if (parent.placeholder) {
							parent.onChange(DELETED, parent.getID());
						}
					}
				}
			}
		});
	},


	toParentPlaceHolder (threadableReply = this) {
		let result = {};

		let refs = (threadableReply.references || []).slice();
		if (refs.length) {
			refs.pop();
		}

		//Make sure we create a new date object so we don't mutate the the field in the child record.
		//this placeholder "happened in the past" so take the existing time and move it back
		let ct = new Date(threadableReply.getCreatedTime().getTime());
		ct.setSeconds(ct.getSeconds() - 1);

		//We need to bring these values up onto the current object otherwise when we save it,
		//they will not be enumerated since they would not be "Owned"
		let {style, applicableRange, sharedWith, selectedText, title, Class, ContainerId, MimeType} = threadableReply;

		Object.assign(result, {
			ReferencedByCount: 0,
			applicableRange: applicableRange && applicableRange.getData(),
			body: ['This message has been deleted.'],
			Class,
			ContainerId,
			CreatedTime: ct.getTime() / 1000,
			Creator: '',
			inReplyTo: refs[refs.length - 1],
			'Last Modified': ct.getTime() / 1000,
			MimeType,
			NTIID: threadableReply.inReplyTo,
			phantom: void 0,
			placeholder: true,
			references: refs,
			selectedText,
			sharedWith,
			style,
			title
		});

		result = this[Parser](result);

		delete result.ReferencedByCount;
		Object.defineProperty(result, 'ReferencedByCount', {
			get () {
				let children = this[CHILDREN];
				if (!Array.isArray(children)) {
					return 0;
				}

				return children.length + children.reduce((sum, x) => sum + x.ReferencedByCount, 0);
			}
		});

		return result;
	},


	isLeaf () {
		const impliedLeaf = !this.hasLink('replies') || !this.ReferencedByCount;
		const leafLike = (x => (!x || !x.length && !x.then))(this[CHILDREN]);

		if (impliedLeaf && !leafLike) {
			//wut?
		}

		return leafLike;
	},


	isReply () {
		return this.inReplyTo != null;
	},


	isTopLevel () {
		let hasParent = !!this[PARENT];
		let shouldHaveParent = this.isReply();

		// if ((shouldHaveParent && !hasParent) || (!shouldHaveParent && hasParent)) {
		// 	console.warn('Weird');
		// }

		return !shouldHaveParent && !hasParent;
	},


	getReply (itemId) {
		function find (found, item) {
			if (found) {
				return found;
			}

			if (ntiidEquals(item.getID(), itemId)) {
				return item;
			}

			let children = item[CHILDREN] || {};
			if (children.reduce) {
				return children.reduce(find, null);
			}
		}

		function search (list) {
			//perform the search:
			const item = list.reduce(find, null);
			//get the list of children promises. (if we have an hit, short-circuit)
			const pendingChildren = item ? [] : list.map(x => x[CHILDREN]).filter(x => (x || {}).then);

			//if our search didn't yeild anything, and we have pending children... wait on them, and then search them.
			if (!item &&  pendingChildren.length > 0) {

				return Promise.all(pendingChildren) //These will resolve to lists... so
				//flatten the list-of-lists to a single list.
					.then(x => x.reduce((l, a) => l.concat(a), []))
				//then start the search over with the new children
					.then(get);
			}

			return item;
		}

		function get (waitOn) {
			//the list waitOn can contain items and/or Promises...
			//passing it through "Promise.all" normalizes it for us.
			//And waits for all the actual promises to resolve.
			return Promise.all(waitOn).then(search);
		}

		return this.getReplies()
			.then(x => get(x))
			.then(x => !x ? Promise.reject(`Not Found: "${itemId}"`) : x);
	},


	getRecentReplies (count = 1) {
		let shouldRequest = this.hasLink('replies');
		let request = shouldRequest ?
			this.fetchLinkParsed('replies', {
				sortOn: 'createdTime',
				sortOrder: 'descending',
				batchSize: count
			}) :
			Promise.resolve();

		// reverse to date-ascending order
		return request.then(results => (results || []).reverse());
	},

	getReplies () {
		let children = this[CHILDREN];

		if (this.placeholder) {
			//If we're a placeholder, we need to aggregate the replies from our children.
			//We want to wait on the children's getReplies, but we want to fulfill with OUR direct children.
			if (!Array.isArray(children) && children) {
				if (children.then) { return children; }

				children = [children];
			}
			return Promise.all(children || [])
				.then(c => Promise.all(  c.map(  x => x.getReplies().then(() => x)  )  ));
		}

		if (children) {
			return Promise.resolve(children);
		}

		let shouldRequest = this.hasLink('replies') && this.ReferencedByCount > 0;

		//do not make a request that we know will probably fail or result in nothing.
		let request = shouldRequest ?
			this.fetchLinkParsed('replies') :
			Promise.resolve();

		return (this[CHILDREN] = request
			.then(x => {
				//do we have replies?
				if (!x || !x.length) {
					return (this[CHILDREN] = []); //no? resolve with empty list
				}

				let parent = this[PARENT];

				//yes? thread.
				delete this[CHILDREN]; //thread() doesn't like promises on this key :P

				//prevent a placeholder from being generated AND get the Thread-Links applied to "this"
				let tree = [this].concat(x);

				thread(tree); //thread returns all the trees represented by the array of items passed, and adds pointers to the tree branches and parents.

				//thread() may have changed our PARENT to point to a new placeholder...
				delete this[PARENT]; //no matter what, we do not want the parent from the thread() call
				if (parent) {
					//put our pointer back
					this[PARENT] = parent;
				}

				//thread() updated our CHILDREN property as well.
				return this[CHILDREN];
			})

			.catch(x => { //catch any error, and clear the CHILDREN key.

				delete this[CHILDREN];
				return Promise.reject(x);//continue the error
			})
		);
	},


	appendNewChild (newChild) {
		this.ReferencedByCount++;
		newChild[PARENT] = this;

		let children = this[CHILDREN] || [];

		this[CHILDREN] = [...children, newChild];
	}
};
