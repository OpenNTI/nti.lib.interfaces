import {getModelByType} from '../../../models';

const ContentRangeDescription = getModelByType('contentrange.contentrangedescription');

describe('ContentRangeDescription Tests', () => {
	describe('locator tests', () => {

		function createCRD () {
			return new ContentRangeDescription(null, null, {});
		}

		it('attaching and retrieving', () => {
			let d = createCRD();
			expect(d.locator()).to.be.undefined;

			d.attachLocator('foo');
			expect(d.locator()).to.equal('foo');

			d.attachLocator(null);
			expect(d.locator()).to.be.undefined;
		});


		it('Doesn\'t externalize', () => {
			let d = createCRD();
			d.attachLocator('foo');

			let o = d.getData();
			expect(o).to.be.ok;
			expect(o[Symbol.for('locator')]).to.be.undefined;
		});


		it('is empty', () => {
			let d = createCRD();
			expect(d.isEmpty).to.be.ok;
		});

	});
});
