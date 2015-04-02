import nsKeyMirror from '../namespaced-key-mirror';

describe('namespaced-key-mirror', ()=> {

	let input = {
		key1: null,
		key2: null
	};

	let namespace = 'test';

	it('should return an object with values equal to namespace:key', ()=> {
		let expectedOutput = {
			key1: 'test:key1',
			key2: 'test:key2'
		};
		expect(nsKeyMirror(namespace, input)).toEqual(expectedOutput);
	});

	it('should return keys equal to values if no namespace is given', ()=> {
		let expectedOutput = {
			key1: 'key1',
			key2: 'key2'
		};
		expect(nsKeyMirror(null, input)).toEqual(expectedOutput);
	});

	it('should use the specified separator', ()=> {

		let separator = '-';

		let expectedOutput = {
			key1: 'test-key1',
			key2: 'test-key2'
		};

		expect(nsKeyMirror(namespace, input, separator)).toEqual(expectedOutput);
	});

	it('should throw if handed a non-string namespace', ()=> {
		expect(nsKeyMirror.bind(null, input)).toThrow();
	});

	it('should throw if handed a non-object', ()=> {
		expect(nsKeyMirror.bind(null, namespace, 'bad input')).toThrow();
	});

});
