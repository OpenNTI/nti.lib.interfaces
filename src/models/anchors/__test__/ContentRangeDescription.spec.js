/* eslint-env jest */
import ContentRangeDescription from '../ContentRangeDescription';
import MockService from '../../__test__/mock-service';

describe('ContentRangeDescription Tests', () => {
	describe('locator tests', () => {
		function createCRD() {
			return new ContentRangeDescription(MockService, null, {});
		}

		test('attaching and retrieving', () => {
			let d = createCRD();
			expect(d.locator()).toBeUndefined();

			d.attachLocator('foo');
			expect(d.locator()).toEqual('foo');

			d.attachLocator(null);
			expect(d.locator()).toBeUndefined();
		});

		test("Doesn't externalize", () => {
			let d = createCRD();
			d.attachLocator('foo');

			let o = d.getData();
			expect(o).toBeTruthy();
			expect(o[Symbol.for('locator')]).toBeUndefined();
		});

		test('is empty', () => {
			let d = createCRD();
			expect(d.isEmpty).toBeTruthy();
		});
	});
});
