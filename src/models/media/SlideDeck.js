import {Parser as parse} from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

@model
export default class SlideDeck extends Base {
	static MimeType = COMMON_PREFIX + 'ntislidedeck'

	constructor (service, parent, data) {
		delete data.creator;
		super(service, parent, data, {isSlideDeck: true});
		this[parse]('Slides');
		this[parse]('Videos');

		/*
		byline: "Deborah Trytten"
		title: "Arrays of Primitive Data"
		*/
	}
}
