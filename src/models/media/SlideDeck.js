import {mixin, readonly} from 'nti-lib-decorators';

import {Parser as parse} from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

@model
@mixin({@readonly isSlideDeck: true})
export default class SlideDeck extends Base {
	static MimeType = COMMON_PREFIX + 'ntislidedeck'

	constructor (service, parent, data) {
		delete data.creator;
		super(service, parent, data);
		this[parse]('Slides');
		this[parse]('Videos');

		/*
		byline: "Deborah Trytten"
		title: "Arrays of Primitive Data"
		*/
	}
}
