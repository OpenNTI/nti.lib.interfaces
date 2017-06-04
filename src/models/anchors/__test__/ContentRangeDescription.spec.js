import {Registry} from '../../index';

const ContentRangeDescription = Registry.lookup('contentrange.contentrangedescription');

describe('ContentRangeDescription Tests', () => {
	describe('locator tests', () => {

		function createCRD () {
			return new ContentRangeDescription(null, null, {});
		}

		it('attaching and retrieving', () => {
			let d = createCRD();
			expect(d.locator()).toBeUndefined();

			d.attachLocator('foo');
			expect(d.locator()).toEqual('foo');

			d.attachLocator(null);
			expect(d.locator()).toBeUndefined();
		});


		it('Doesn\'t externalize', () => {
			let d = createCRD();
			d.attachLocator('foo');

			let o = d.getData();
			expect(o).toBeTruthy();
			expect(o[Symbol.for('locator')]).toBeUndefined();
		});


		it('is empty', () => {
			let d = createCRD();
			expect(d.isEmpty).toBeTruthy();
		});

	});
});
