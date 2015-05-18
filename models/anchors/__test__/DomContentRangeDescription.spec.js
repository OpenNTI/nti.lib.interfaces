import DomContentRangeDescription from '../DomContentRangeDescription';

//Subclass and override constructor for testing so we can easily create one of these
class TestDomContentRangeDescription extends DomContentRangeDescription {
	constructor () {}
}


describe('DomContentRangeDescription Tests', () => {
	describe('tests', () => {

		function createDCRD() {
			return new TestDomContentRangeDescription(null, null, {});
		}

		//This ??? wtf?
		it('is not empty', () => {
			let d = createDCRD();
			expect(d.isEmpty).toEqual(false);
		});

	});
});
