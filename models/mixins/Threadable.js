import {Parser} from '../../CommonSymbols';
import {thread, CHILDREN} from '../../utils/UserDataThreader';

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
		let {style, applicableRange, sharedWith, selectedText, Class, ContainerId, MimeType} = threadableReply;

		Object.assign(result, {
			applicableRange,
			body: [],
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
			style
		});

		result = this[Parser](result);

		return result;
	},


	isTopLevel () {
		let hasParent = !!this[PARENT];
		let shouldHaveParent = this.inReplyTo != null;

		if ((shouldHaveParent && !hasParent) || (!shouldHaveParent && hasParent)) {
			console.warn('Weird');
		}

		return !shouldHaveParent && !hasParent;
	},


	getReplies () {
		if (this[CHILDREN]) {
			return Promise.resolve(this[CHILDREN]);
		}

		return this.fetchLinkParsed('replies')
			.then(x =>
				thread(
					[this].concat(x) //prevent a placeholder from being generated AND get the Thread-Links applied to "this"
				)
				[0][CHILDREN]
			);
	}
};
