import Base from './Base';
import {Parser as parse} from '../constants';

//MimeType: "application/vnd.nextthought.ntislidedeck"
export default class SlideDeck extends Base {

	constructor (service, parent, data) {
		super(service, parent, data);
		this[parse]('Slides');
		this[parse]('Videos');

		/*
		byline: "Deborah Trytten"
		title: "Arrays of Primitive Data"
		*/
	}
}
