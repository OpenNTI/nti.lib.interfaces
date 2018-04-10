/* eslint-env jest */
import getFuzzyTargetProperty from '../get-fuzzy-target-property';


describe('getFuzzyTargetProperty', () => {
	test('matches Target-NTIID', () => {
		const obj = {
			'Target-NTIID': 'test-id'
		};

		expect(getFuzzyTargetProperty(obj)).toEqual('Target-NTIID');
	});

	test('matches target-NTIID', () => {
		const obj = {
			'target-NTIID': 'test'
		};

		expect(getFuzzyTargetProperty(obj)).toEqual('target-NTIID');
	});

	test('matches NTIID', () => {
		const obj = {
			NTIID: 'test'
		};

		expect(getFuzzyTargetProperty(obj)).toEqual('NTIID');
	});

	test('matches ntiid', () => {
		const obj = {
			ntiid: 'test'
		};


		expect(getFuzzyTargetProperty(obj)).toEqual('ntiid');
	});

	test('Prefers Target-NTIID over NTIID', () => {
		const obj = {
			'NTIID': 'test-ntiid',
			'Target-NTIID': 'test-target-ntiid'
		};

		expect(getFuzzyTargetProperty(obj)).toEqual('Target-NTIID');
	});
});
