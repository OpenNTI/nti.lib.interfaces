import {Parser} from '../../CommonSymbols';
import {thread, CHILDREN, PARENT} from '../../utils/UserDataThreader';

export default {
	isThreadable: true,

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
			applicableRange,
			body: ['This message has been deleted.'],
			Class,
			ContainerId,
			CreatedTime: ct,
			Creator: '',
			inReplyTo: refs[refs.length - 1],
			'Last Modified': new Date(ct.getTime()),
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

		return result;
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


	getReplies () {
		let children = this[CHILDREN];

		if (this.placeholder) {
			//If we're a placeholder, we need to aggregate the replies from our children.
			//We want to wait on the children's getReplies, but we want to fulfill with OUR direct children.
			return Promise.all(children.map(x => x.getReplies().then(() => x)));
		}

		if (children) {
			return Promise.resolve(children);
		}

		let shouldRequest = this.hasLink('replies') && this.ReferencedByCount > 0;

		//do not make a request that we know will probably fail or result in nothing.
		let request = shouldRequest ?
			this.fetchLinkParsed('replies') :
			Promise.resolve();

		this[CHILDREN] = request;

		return request
			.then(x => {
				//do we have replies?
				if (!x || !x.length) {
					return []; //no? resolve with empty list
				}

				//yes? thread.
				delete this[CHILDREN]; //thread() doesn't like promises on this key :P

				//prevent a placeholder from being generated AND get the Thread-Links applied to "this"
				let tree = [this].concat(x);
				let trees = thread(tree); //thread returns all the trees represented by the array of items passed.

				return trees[0] //We only passed data for our tree... so get the one-and-only tree
								// (first element in the returned array)
							[CHILDREN]; //And We only want the replies to the trunk...so get the list of CHILDREN.
			})
			//Then apply the final result to our CHILDREN
			.then(x => (this[CHILDREN] = x))

			.catch(x => { //catch any error, and clear the CHILDREN key.

				delete this[CHILDREN];
				return Promise.reject(x);//continue the error
			});
	},


	appendNewChild (newChild) {
		let children = this[CHILDREN] = (this[CHILDREN] || []).slice();

		newChild[PARENT] = this;

		children.push(newChild);
	}
};
