import ensureArray from '../ensure-array';

describe('ensure-array', ()=> {

	it('should return the array that is passed', ()=> {
		let a = [1, 2, 3];
		let b = [];

		expect(ensureArray(a)).toBe(a);
		expect(ensureArray(b)).toBe(b);
	});


	it('should return [arg0] when arg0 is not an array', ()=> {
		let tests = [0, 1, '', 'a', false, true, NaN, Infinity, -Infinity, {}];
		for(let x of tests) {
			expect(ensureArray(x)).toEqual([x]);
		}
	});


	it('should return [] when arg0 is not anything', ()=> {
		let empty = [];
		expect(ensureArray()).toEqual(empty);
		expect(ensureArray(null)).toEqual(empty);
		expect(ensureArray(undefined)).toEqual(empty);
	});

});
