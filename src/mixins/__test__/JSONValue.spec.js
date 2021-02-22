/* eslint-disable no-console */
/* eslint-env jest */

import JSONValue from '../JSONValue';

test('JSONValue handles cycles', () => {
	jest.spyOn(console, 'warn').mockImplementation(() => {});
	const A = { ...JSONValue, name: 'Foo', ref: {} };
	const B = { ...JSONValue, name: 'Bar', ref: { A } };
	A.B = B;
	A.ref.B = B;

	expect(A.getData()).toEqual({
		B: { name: 'Bar', ref: { A: undefined } },
		name: 'Foo',
		ref: { B: { name: 'Bar', ref: { A: undefined } } },
	});

	expect(JSON.stringify(A, null, 2)).toMatchInlineSnapshot(`
		"{
		  \\"name\\": \\"Foo\\",
		  \\"ref\\": {
		    \\"B\\": {
		      \\"name\\": \\"Bar\\",
		      \\"ref\\": {}
		    }
		  },
		  \\"B\\": {
		    \\"name\\": \\"Bar\\",
		    \\"ref\\": {}
		  }
		}"
	`);

	expect(console.warn).toHaveBeenCalledWith('Data Cycle Detected');
});
