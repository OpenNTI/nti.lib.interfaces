import RealDomContentPointer from '../DomContentPointer';
import RealElementDomContentPointer from '../ElementDomContentPointer';
import RealTextDomContentPointer from '../TextDomContentPointer';
import RealDomContentRangeDescription from '../DomContentRangeDescription';
import RealTextContext from '../TextContext';

class DomContentPointer extends RealDomContentPointer { constructor(o) { super(null, null, o); } }
class ElementDomContentPointer extends RealElementDomContentPointer { constructor(o) { super(null, null, o); } }
class TextDomContentPointer extends RealTextDomContentPointer { constructor(o) { super(null, null, o); } }
class DomContentRangeDescription extends RealDomContentRangeDescription { constructor(o) { super(null, null, o); } }
class TextContext extends RealTextContext { constructor(o) { super(null, null, o); } }


describe('Model Tests', () => {
	/*eslint-disable no-new*/
	it('Good TextContent Creation', () => {
		let text = 'This is some text',
			offset = 5,
			ct = new TextContext({contextText: text, contextOffset: offset});

		expect(ct).toBeTruthy();
		expect(ct.getContextText()).toEqual(text);
		expect(ct.getContextOffset()).toEqual(offset);
	});

	it('Bad TextContent Creation', () => {
		try {
			new TextContext({contextText: '', contextOffset: 5});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toEqual('Text must have one or more characters');
		}
		try {
			new TextContext({contextOffset: 5});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toEqual('Text must have one or more characters');
		}
		try {
			new TextContext({contextText: 'text', contextOffset: -1});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toEqual('Offset must be greater than 0, supplied value: -1');
		}
		try {
			new TextContext({contextText: 'text'});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toEqual('No offset supplied');
		}
	});


	it('Good DomContentPointer Creation', () => {
		let role = 'end',
			ca = new DomContentPointer({role: role});

		expect(ca.getRole()).toBe(role);
	});


	it('Bad DomContentPointer Creation', () => {
		try {
			new DomContentPointer({role: 'invalid'});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toEqual('Role must be of the value start,end,ancestor, supplied invalid');
		}

		try {
			new DomContentPointer({});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toEqual('Must supply a role');
		}
	});

	it('Good ElementDomContentPointer Creation via config', () => {
		let id = 'a1234567',
			tagName = 'SOMETAGNAME',
			role = 'end',
			ca = new ElementDomContentPointer({elementId: id, elementTagName: tagName, role: role});

		expect(ca.getElementTagName()).toBe(tagName);
		expect(ca.getElementId()).toBe(id);
		expect(ca.getRole()).toBe(role);
	});

	it('Good ElementDomContentPointer Creation via node', () => {
		let id = 'a1234567',
			tagName = 'SOMETAGNAME',
			role = 'start',
			element = document.createElement(tagName), ca;

		element.setAttribute('id', id);
		ca = new ElementDomContentPointer({node: element, role: role});

		expect(ca.getElementTagName()).toBe(tagName);
		expect(ca.getElementId()).toBe(id);
		expect(ca.getRole()).toBe(role);
	});

	it('Bad ElementDomContentPointer Creation', () => {
		try {
			new ElementDomContentPointer({elementTagName: 'name', role: 'end'});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toBe('Must supply an Id');
		}

		try {
			new ElementDomContentPointer({elementId: 'id', role: 'start'});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toBe('Must supply a tag name');
		}

		try {
			new ElementDomContentPointer({elementId: 'id', elementTagName: 'tagName', role: 'wrong'});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toBe('Role must be of the value start,end,ancestor, supplied wrong');
		}

		try {
			new ElementDomContentPointer({elementId: 'id', elementTagName: 'tagName'});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toBe('Must supply a role');
		}
	});

	it('Good TextDomContentPointer Creation', () => {
		let	cfg = {
				ancestor: new ElementDomContentPointer({
					elementId: 'id',
					elementTagName: 'tagName',
					role: 'ancestor'
				}),
				role: 'start',
				edgeOffset: 5,
				contexts: [
					new TextContext({contextText: 'text1', contextOffset: 0}),
					new TextContext({contextText: 'text2', contextOffset: 1}),
					new TextContext({contextText: 'text3', contextOffset: 2})
				]
			},
			x = new TextDomContentPointer(cfg);

		expect(x.getEdgeOffset()).toEqual(cfg.edgeOffset);
		expect(x.getContexts()).toBeTruthy();
		expect(x.getContexts().length).toEqual(cfg.contexts.length);
		expect(x.getAncestor().getRole()).toEqual('ancestor');
		expect(x.getAncestor().getElementTagName()).toEqual('TAGNAME');
		expect(x.getAncestor().getElementId()).toEqual('id');
		expect(x.getRole()).toEqual(cfg.role);
	});

	it('Bad TextDomContentPointer Creation', () => {
		try {

			new TextDomContentPointer({
				role: 'ancestor',
				edgeOffset: 5,
				contexts: []
			});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toEqual('Must supply at least 1 TextContext');
		}

		try {
			new TextDomContentPointer({
				role: 'ancestor',
				edgeOffset: 5
			});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toEqual('Must supply TextContexts');
		}

		try {
			new TextDomContentPointer({
				role: 'ancestor',
				contexts: [
					new TextContext({contextText: 'text1', contextOffset: 0}),
					new TextContext({contextText: 'text2', contextOffset: 1}),
					new TextContext({contextText: 'text3', contextOffset: 2})
				]
			});
			expect(false).toBeTruthy();
		}
		catch (e) {
			//expect(e.message).toEqual('Offset must exist and be 0 or more');
			console.warn('This test is in question, can we have a negative edgeOffset???, Ask Chris');
		}

		try {
			new TextDomContentPointer({
				role: 'ancestor',
				edgeOffset: 3,
				contexts: [
					new TextContext({contextText: 'text1', contextOffset: 0}),
					new TextContext({contextText: 'text2', contextOffset: 1}),
					new TextContext({contextText: 'text3', contextOffset: 2})
				]
			});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toEqual('Ancestor must be supplied');
		}

		try {
			new TextDomContentPointer({
				role: 'ancestor',
				edgeOffset: 3,
				ancestor: new ElementDomContentPointer({
					elementId: 'id',
					elementTagName: 'tagName',
					role: 'end' //must be ancestor
				}),
				contexts: [
					new TextContext({contextText: 'text1', contextOffset: 0}),
					new TextContext({contextText: 'text2', contextOffset: 1}),
					new TextContext({contextText: 'text3', contextOffset: 2})
				]
			});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toEqual('If ancestor is an ElementDomContentPointer, role must be of value ancestor');
		}
	});

	it('Good DomContentRangeDescription Creation', () => {
		let tca1 = new TextDomContentPointer({
				role: 'start',
				ancestor: new ElementDomContentPointer({
					elementId: 'id',
					elementTagName: 'tagName',
					role: 'ancestor'
				}),
				edgeOffset: 5,
				contexts: [
					new TextContext({contextText: 'text1', contextOffset: 0}),
					new TextContext({contextText: 'text2', contextOffset: 1}),
					new TextContext({contextText: 'text3', contextOffset: 2})
				]
			}),
			tca2 = new TextDomContentPointer({
				role: 'start',
				ancestor: new ElementDomContentPointer({
					elementId: 'id',
					elementTagName: 'tagName',
					role: 'ancestor'
				}),
				edgeOffset: 5,
				contexts: [
					new TextContext({contextText: 'text1', contextOffset: 0}),
					new TextContext({contextText: 'text2', contextOffset: 1}),
					new TextContext({contextText: 'text3', contextOffset: 2})
				]
			}),
			ca1 = new TextDomContentPointer({
				role: 'start',
				ancestor: new ElementDomContentPointer({
					elementId: 'id',
					elementTagName: 'tagName',
					role: 'ancestor'
				}),
				edgeOffset: 5,
				contexts: [
					new TextContext({contextText: 'text1', contextOffset: 0}),
					new TextContext({contextText: 'text2', contextOffset: 1}),
					new TextContext({contextText: 'text3', contextOffset: 2})
				]
			}),
			dcrd = new DomContentRangeDescription({
				start: tca1,
				end: tca2,
				ancestor: ca1
			});

		expect(dcrd.getStart()).toBeTruthy();
		expect(dcrd.getEnd()).toBeTruthy();
		expect(dcrd.getAncestor()).toBeTruthy();
	});

	it('Bad DomContentRangeDescription Creation', () => {
		let tca1 = new TextDomContentPointer({
				role: 'start',
				ancestor: new ElementDomContentPointer({
					elementId: 'id',
					elementTagName: 'tagName',
					role: 'ancestor'
				}),
				edgeOffset: 5,
				contexts: [
					new TextContext({contextText: 'text1', contextOffset: 0}),
					new TextContext({contextText: 'text2', contextOffset: 1}),
					new TextContext({contextText: 'text3', contextOffset: 2})
				]
			}),
			tca2 = new TextDomContentPointer({
				role: 'start',
				edgeOffset: 5,
				ancestor: new ElementDomContentPointer({
					elementId: 'id',
					elementTagName: 'tagName',
					role: 'ancestor'
				}),
				contexts: [
					new TextContext({contextText: 'text1', contextOffset: 0}),
					new TextContext({contextText: 'text2', contextOffset: 1}),
					new TextContext({contextText: 'text3', contextOffset: 2})
				]
			});

		try {
			new DomContentRangeDescription({
				start: tca1,
				end: tca2
			});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toEqual('Invalid contents');
		}
	});
});
