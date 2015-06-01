
export default {
	isThreadable: true,

	toParentPlaceHolder (threadableReply = this) {
		//the result object will have the "reply" as the prototype.
		let result = Object.create(threadableReply);

		let refs = (threadableReply.get('references') || []).slice();
		if (refs.length) {
			refs.pop();
		}

		//Make sure we create a new date object so we don't mutate the the field in the child record.
		//this placeholder "happened in the past" so take the existing time and move it back
		let ct = new Date(threadableReply.getCreatedTime().getTime());
		ct.setSeconds(ct.getSeconds() - 1);

		//We need to bring these values up onto the current object otherwise when we save it,
		//they will not be enumerated since they would not be "Owned"
		let {style, applicableRange, sharedWith, selectedText, ContainerId} = threadableReply;

		Object.assign(result, {
			//Modified Values:
			'Last Modified': new Date(ct.getTime()),
			CreatedTime: ct,
			Creator: '',
			placeholder: true,
			phantom: void 0,
			NTIID: threadableReply.inReplyTo,
			references: refs,
			inReplyTo: refs[refs.length - 1],
			//Echoed Values
			style, applicableRange, sharedWith, selectedText, ContainerId
		});

		return result;
	}

};
