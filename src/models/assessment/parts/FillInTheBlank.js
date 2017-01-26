import Part from '../Part';
import {ContentKeys} from '../../../mixins/HasContent';

const isShortAnswer = RegExp.prototype.test.bind(/ShortAnswer/i);
const hasInputs = RegExp.prototype.test.bind(/<input/i);

const tags = /<input[^>]+blankfield[^>]+>/ig;
const keyName = /name=['"]([^'"]+)['"]/i;

const ValueKeys = Symbol('value-keys');


export default class FillInTheBlank extends Part {
	constructor (service, parent, data) {
		if (isShortAnswer(data.MimeType)) {
			// FillInTheBlankShortAnswer is F'd up... the content has input boxes in many
			// instances (possibly all instances). That should be illegal. The text with
			// interspersed inputs should ONLY in the 'input' field.
			// So, if we detect that the content has <input tags, prefix the content to
			// the input field, and blank out the content field.
			if (hasInputs(data.content)) {
				data.input = data.content + ' ' + (data.input || '');
				data.content = '';
			}
		}

		super(service, parent, data);

		this[ValueKeys] = (this.input.match(tags) || [])
			.map(s=>(s.match(keyName) || {})[1]);
	}


	[ContentKeys] () { return super[ContentKeys]().concat(['input']); }


	isAnswered (partValue) {
		let maybe = true;
		let keys = this[ValueKeys];

		for(let i of keys) {
			//all values have to be non-nully
			maybe = maybe && partValue && partValue[i] != null;
		}

		return maybe;
	}
}
