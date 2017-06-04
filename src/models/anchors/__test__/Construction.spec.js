import {Registry} from '../../index';

const DomContentPointer = Registry.lookup('contentrange.domcontentpointer');
const ElementDomContentPointer = Registry.lookup('contentrange.elementdomcontentpointer');
const TextDomContentPointer = Registry.lookup('contentrange.textdomcontentpointer');
const DomContentRangeDescription = Registry.lookup('contentrange.domcontentrangedescription');
const TextContext = Registry.lookup('contentrange.textcontext');


const make = (C, o) => new C(null, null, o);

describe('Model Tests', () => {

	test('Good TextContent Creation', () => {
		let text = 'This is some text',
			offset = 5,
			ct = make(TextContext, {contextText: text, contextOffset: offset});

		expect(ct).toBeTruthy();
		expect(ct.getContextText()).toEqual(text);
		expect(ct.getContextOffset()).toEqual(offset);
	});


	test('Bad TextContent Creation', () => {
		try {
			make(TextContext, {contextText: '', contextOffset: 5});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toEqual('Text must have one or more characters');
		}
		try {
			make(TextContext, {contextOffset: 5});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toEqual('Text must have one or more characters');
		}
		try {
			make(TextContext, {contextText: 'text', contextOffset: -1});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toEqual('Offset must be greater than 0, supplied value: -1');
		}
		try {
			make(TextContext, {contextText: 'text'});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toEqual('No offset supplied');
		}
	});


	test('Good DomContentPointer Creation', () => {
		let role = 'end',
			ca = make(DomContentPointer, {role: role});

		expect(ca.getRole()).toEqual(role);
	});


	test('Bad DomContentPointer Creation', () => {
		try {
			make(DomContentPointer, {role: 'invalid'});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toEqual('Role must be of the value start,end,ancestor, supplied invalid');
		}

		try {
			make(DomContentPointer, {});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toEqual('Must supply a role');
		}
	});


	test('Good ElementDomContentPointer Creation via config', () => {
		let id = 'a1234567',
			tagName = 'SOMETAGNAME',
			role = 'end',
			ca = make(ElementDomContentPointer, {elementId: id, elementTagName: tagName, role: role});

		expect(ca.getElementTagName()).toEqual(tagName);
		expect(ca.getElementId()).toEqual(id);
		expect(ca.getRole()).toEqual(role);
	});


	test('Good ElementDomContentPointer Creation via node', () => {
		let id = 'a1234567',
			tagName = 'SOMETAGNAME',
			role = 'start',
			element = {tagName, id, getAttribute: (name) => name === 'id' ? id : '' },//fake it until you make it!
			ca;

		ca = make(ElementDomContentPointer, {node: element, role: role});

		expect(ca.getElementTagName()).toEqual(tagName);
		expect(ca.getElementId()).toEqual(id);
		expect(ca.getRole()).toEqual(role);
	});


	test('Bad ElementDomContentPointer Creation', () => {
		try {
			make(ElementDomContentPointer, {elementTagName: 'name', role: 'end'});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toEqual('Must supply an Id');
		}

		try {
			make(ElementDomContentPointer, {elementId: 'id', role: 'start'});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toEqual('Must supply a tag name');
		}

		try {
			make(ElementDomContentPointer, {elementId: 'id', elementTagName: 'tagName', role: 'wrong'});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toEqual('Role must be of the value start,end,ancestor, supplied wrong');
		}

		try {
			make(ElementDomContentPointer, {elementId: 'id', elementTagName: 'tagName'});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toEqual('Must supply a role');
		}
	});


	test('Good TextDomContentPointer Creation', () => {
		const cfg = {
			ancestor: {
				MimeType: ElementDomContentPointer.MimeType,
				elementId: 'id',
				elementTagName: 'tagName',
				role: 'ancestor'
			},
			role: 'start',
			edgeOffset: 5,
			contexts: [
				{MimeType: TextContext.MimeType, contextText: 'text1', contextOffset: 0},
				{MimeType: TextContext.MimeType, contextText: 'text2', contextOffset: 1},
				{MimeType: TextContext.MimeType, contextText: 'text3', contextOffset: 2},
			]
		};

		const x = make(TextDomContentPointer, cfg);

		expect(x.getEdgeOffset()).toEqual(cfg.edgeOffset);
		expect(x.getContexts()).toBeTruthy();
		expect(x.getContexts().length).toEqual(cfg.contexts.length);
		expect(x.getAncestor().getRole()).toEqual('ancestor');
		expect(x.getAncestor().getElementTagName()).toEqual('TAGNAME');
		expect(x.getAncestor().getElementId()).toEqual('id');
		expect(x.getRole()).toEqual(cfg.role);
	});


	test('Bad TextDomContentPointer Creation', () => {
		try {

			make(TextDomContentPointer, {
				role: 'ancestor',
				edgeOffset: 5,
				// the constructor will delete this because it was empty, so update the
				// tests. (the message this was checking is now nearly impossible to get.)
				contexts: []
			});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toEqual('Must supply TextContexts');
		}

		try {
			make(TextDomContentPointer, {
				role: 'ancestor',
				edgeOffset: 5
			});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toEqual('Must supply TextContexts');
		}

		// This test is in question, can we have a negative edgeOffset?, Ask Chris
		/*try {
			make(TextDomContentPointer, {
				role: 'ancestor',
				contexts: [
					{MimeType: TextContext.MimeType, contextText: 'text1', contextOffset: 0},
					{MimeType: TextContext.MimeType, contextText: 'text2', contextOffset: 1},
					{MimeType: TextContext.MimeType, contextText: 'text3', contextOffset: 2},
				]
			});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toEqual('Offset must exist and be 0 or more');
		}*/

		try {
			make(TextDomContentPointer, {
				role: 'ancestor',
				edgeOffset: 3,
				contexts: [
					{MimeType: TextContext.MimeType, contextText: 'text1', contextOffset: 0},
					{MimeType: TextContext.MimeType, contextText: 'text2', contextOffset: 1},
					{MimeType: TextContext.MimeType, contextText: 'text3', contextOffset: 2},
				]
			});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toEqual('Ancestor must be supplied');
		}

		try {
			make(TextDomContentPointer, {
				role: 'ancestor',
				edgeOffset: 3,
				ancestor: make(ElementDomContentPointer, {
					elementId: 'id',
					elementTagName: 'tagName',
					role: 'end' //must be ancestor
				}),
				contexts: [
					{MimeType: TextContext.MimeType, contextText: 'text1', contextOffset: 0},
					{MimeType: TextContext.MimeType, contextText: 'text2', contextOffset: 1},
					{MimeType: TextContext.MimeType, contextText: 'text3', contextOffset: 2},
				]
			});
			expect(false).toBeTruthy();
		}
		catch (e) {
			expect(e.message).toEqual('If ancestor is an ElementDomContentPointer, role must be of value ancestor');
		}
	});


	test('Good DomContentRangeDescription Creation', () => {
		let tca1 = make(TextDomContentPointer, {
				role: 'start',
				ancestor: make(ElementDomContentPointer, {
					elementId: 'id',
					elementTagName: 'tagName',
					role: 'ancestor'
				}),
				edgeOffset: 5,
				contexts: [
					{MimeType: TextContext.MimeType, contextText: 'text1', contextOffset: 0},
					{MimeType: TextContext.MimeType, contextText: 'text2', contextOffset: 1},
					{MimeType: TextContext.MimeType, contextText: 'text3', contextOffset: 2},
				]
			}),
			tca2 = make(TextDomContentPointer, {
				role: 'start',
				ancestor: make(ElementDomContentPointer, {
					elementId: 'id',
					elementTagName: 'tagName',
					role: 'ancestor'
				}),
				edgeOffset: 5,
				contexts: [
					{MimeType: TextContext.MimeType, contextText: 'text1', contextOffset: 0},
					{MimeType: TextContext.MimeType, contextText: 'text2', contextOffset: 1},
					{MimeType: TextContext.MimeType, contextText: 'text3', contextOffset: 2},
				]
			}),
			ca1 = make(TextDomContentPointer, {
				role: 'start',
				ancestor: make(ElementDomContentPointer, {
					elementId: 'id',
					elementTagName: 'tagName',
					role: 'ancestor'
				}),
				edgeOffset: 5,
				contexts: [
					{MimeType: TextContext.MimeType, contextText: 'text1', contextOffset: 0},
					{MimeType: TextContext.MimeType, contextText: 'text2', contextOffset: 1},
					{MimeType: TextContext.MimeType, contextText: 'text3', contextOffset: 2},
				]
			}),
			dcrd = make(DomContentRangeDescription, {
				start: tca1,
				end: tca2,
				ancestor: ca1
			});

		expect(dcrd.getStart()).toBeTruthy();
		expect(dcrd.getEnd()).toBeTruthy();
		expect(dcrd.getAncestor()).toBeTruthy();
	});


	test('Bad DomContentRangeDescription Creation', () => {
		let tca1 = make(TextDomContentPointer, {
				role: 'start',
				ancestor: make(ElementDomContentPointer, {
					elementId: 'id',
					elementTagName: 'tagName',
					role: 'ancestor'
				}),
				edgeOffset: 5,
				contexts: [
					{MimeType: TextContext.MimeType, contextText: 'text1', contextOffset: 0},
					{MimeType: TextContext.MimeType, contextText: 'text2', contextOffset: 1},
					{MimeType: TextContext.MimeType, contextText: 'text3', contextOffset: 2},
				]
			}),
			tca2 = make(TextDomContentPointer, {
				role: 'start',
				edgeOffset: 5,
				ancestor: make(ElementDomContentPointer, {
					elementId: 'id',
					elementTagName: 'tagName',
					role: 'ancestor'
				}),
				contexts: [
					{MimeType: TextContext.MimeType, contextText: 'text1', contextOffset: 0},
					{MimeType: TextContext.MimeType, contextText: 'text2', contextOffset: 1},
					{MimeType: TextContext.MimeType, contextText: 'text3', contextOffset: 2},
				]
			});

		try {
			make(DomContentRangeDescription, {
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
