import DomContentPointer from './DomContentPointer';

export default class ElementDomContentPointer extends DomContentPointer {

	constructor (service, parent, data, ...mixins) {
		//If we are given a dom element as input, pull the necessary parts and
		//create a config we can use to create this.
		if (data.node) {
			data = {
				elementTagName: data.node.tagName,
				elementId: data.node.getAttribute('data-ntiid') || data.node.getAttribute('id'),
				role: data.role
			};
		}

		//do a little cleaning up, uppercase tagName if we plan on matching tag name later
		if (data.elementTagName) {
			data.elementTagName = data.elementTagName.toUpperCase();
		}

		super(service, parent, data, {Class: 'ElementDomContentPointer'}, ...mixins);

		this.validateTagName(this.elementTagName);
		this.validateId(this.elementId);
	}


	getElementTagName () { return this.elementTagName; }
	getElementId () { return this.elementId; }


	validateId (id) {
		if (!id) {
			throw new Error('Must supply an Id');
		}
	}


	validateTagName (n) {
		if (!n) {
			throw new Error('Must supply a tag name');
		}
	}


	locateRangePointInAncestor (AnchorLib, ancestorNode, startResult) {
		return AnchorLib.locateElementDomContentPointer(this, ancestorNode, startResult);
	}
}