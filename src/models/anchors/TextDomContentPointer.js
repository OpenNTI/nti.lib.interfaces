import { Parser as parse } from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';

import DomContentPointer from './DomContentPointer';
import ElementDomContentPointer from './ElementDomContentPointer';

export default
@model
class TextDomContentPointer extends DomContentPointer {
	static MimeType = COMMON_PREFIX + 'contentrange.textdomcontentpointer'

	constructor (service, parent, data) {
		super(service, parent, data);

		this[parse]('ancestor');
		this[parse]('contexts');

		this.validateContexts(this.contexts);
		this.validateEdgeOffset(this.edgeOffset);
		this.validateAncestor(this.ancestor);
	}


	getAncestor () { return this.ancestor; }
	getContexts () { return this.contexts; }
	getEdgeOffset () { return this.edgeOffset; }


	primaryContext () {
		if (this.getContexts().length > 0) {
			return this.getContexts()[0];
		}
		return null;
	}


	validateAncestor (a) {
		if (!a || !(a instanceof DomContentPointer)) {
			throw new Error('Ancestor must be supplied');
		}
		else if (a instanceof ElementDomContentPointer && a.getRole() !== 'ancestor') {
			throw new Error('If ancestor is an ElementDomContentPointer, role must be of value ancestor');
		}
	}


	validateContexts (contexts) {
		if (contexts == null || !Array.isArray(contexts)) {
			throw new Error('Must supply TextContexts');
		}
		//Because of how our parsing works, empty "known fields" are deleted if they were invalid...
		//so this elseif is nearly impossible to get to.
		else if (contexts.length < 1) {
			throw new Error('Must supply at least 1 TextContext');
		}
	}


	validateEdgeOffset (/*o*/) {
		/*
		if (!o || o < 0) {
			throw new Error('Offset must exist and be 0 or more');
		}
		*/
	}


	locateRangePointInAncestor (AnchorLib, ancestorNode, startResult) {
		return AnchorLib.locateRangeEdgeForAnchor(this, ancestorNode, startResult);
	}
}
