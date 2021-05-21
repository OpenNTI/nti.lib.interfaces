import {
	mixin as HasContent,
	SetupContentProperties,
} from '../../mixins/HasContent.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

//Rules:
// Show Hints from start if they are present. If more than one, increment which one you see every time your show.
// Show Solutions if the part is answered & incorrect (as apposed to correct or 'unknown'), and there are solutions

export default class Part extends HasContent(Base) {
	static MimeType = COMMON_PREFIX + 'assessment.part';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'answerLabel': { type: 'string', content: true },
		'content':     { type: 'string', content: true },
		'explanation': { type: 'string', content: true },
		'AutoGradable':{ type: 'boolean',              },
		'randomized':  { type: 'boolean',              },
		'hints':       { type: 'model[]'               },
		'solutions':   { type: 'model[]'               },
		'wordbank':    { type: 'model[]'               },
	}

	constructor(service, parent, data) {
		super(service, parent, data);
		this.MimeType = (this.MimeType || '').replace(/nongradable/i, '');
	}

	getQuestionId() {
		return this.parent().getID();
	}

	getPartIndex() {
		let p = this.parent() || {};
		let items = p.parts || [];
		return items.indexOf(this);
	}

	isAnswered(partValue) {
		return partValue != null;
	}

	getVideos() {
		if (!global.DOMParser) {
			return [];
		}

		let out = [],
			dom = new global.DOMParser().parseFromString(
				this.content,
				'text/xml'
			), //Safari???
			nodes = dom.querySelectorAll('object.naqvideo');

		for (let i of nodes) {
			let o = {};

			for (let p of i.getElementsByTagName('param')) {
				o[p.getAttribute('name')] = p.getAttribute('value');
			}

			out.push(o);
		}

		return out;
	}

	getWordBankEntry(wid) {
		let p = this.parent() || {};
		let wordbanks = [this.wordbank, p.wordbank].filter(x => x);

		return wordbanks.reduce(
			(found, x) => found || (x && x.getEntry(wid)),
			null
		);
	}

	updateFromAssessed(assessedPart) {
		if (!assessedPart) {
			throw new Error('[Assessment Fillin]: Invalid Argument');
		}

		if (
			assessedPart.getQuestionId() !== this.getQuestionId() ||
			assessedPart.getPartIndex() !== this.getPartIndex()
		) {
			throw new Error('[Assessment Fillin]: Miss-Matched Question/Part');
		}

		for (let p of ['hints', 'solutions']) {
			//Only update this[p] if its blank, or assessedPart[p] is truthy
			// (do not blank out this[p] if its set and assessedPart[p] is not.)
			if (!this[p] || assessedPart[p]) {
				this[p] = assessedPart[p];
			}
		}

		if (assessedPart.explanation) {
			delete this.explanation;
			this[SetupContentProperties](assessedPart, ['explanation']);
		}
	}
}

Registry.register(Part);
