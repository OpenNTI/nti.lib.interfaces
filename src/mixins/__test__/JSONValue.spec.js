/* eslint-disable no-console */
/* eslint-env jest */

import JSONValue from '../JSONValue.js';

test('JSONValue handles cycles', () => {
	jest.spyOn(console, 'warn').mockImplementation(() => {});
	const A = new (class A extends JSONValue() {
		name = 'Foo';
		ref = {};
		nullKey = null;
	})();
	const B = new (class B extends JSONValue() {
		name = 'Bar';
		ref = {};
	})();
	A.B = B;
	A.ref.B = B;
	B.ref.A = A;

	expect(A.getData()).toMatchInlineSnapshot(`
		Object {
		  "B": Object {
		    "name": "Bar",
		    "ref": Object {
		      "A": undefined,
		    },
		  },
		  "name": "Foo",
		  "nullKey": null,
		  "ref": Object {
		    "B": Object {
		      "name": "Bar",
		      "ref": Object {
		        "A": undefined,
		      },
		    },
		  },
		}
	`);

	expect(JSON.stringify(A, null, 2)).toMatchInlineSnapshot(`
		"{
		  \\"name\\": \\"Foo\\",
		  \\"ref\\": {
		    \\"B\\": {
		      \\"name\\": \\"Bar\\",
		      \\"ref\\": {}
		    }
		  },
		  \\"nullKey\\": null,
		  \\"B\\": {
		    \\"name\\": \\"Bar\\",
		    \\"ref\\": {}
		  }
		}"
	`);

	expect(console.warn).toHaveBeenCalledWith('Data Cycle Detected');
});
