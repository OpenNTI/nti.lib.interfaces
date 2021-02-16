/* eslint-env jest */
import Kaltura from '../kaltura';

const PARTNER_ID = '555';
const ID = '4321';
const FORMATTED_ID = PARTNER_ID + '/' + ID + '/';

describe('Kaltura provider tests', () => {
	test('Resolve ID, no images', async () => {
		const url = 'https://video.kaltura.com/id/' + ID;

		const service = {
			getMetadataFor: () => {
				// meta object
				return Promise.resolve({
					contentLocation:
						'https://cdnapi.kaltura.com/p/' +
						PARTNER_ID +
						'/sp/55500/something/entry_id/' +
						ID,
				});
			},
		};

		const actualID = await Kaltura.resolveID(service, url);

		expect(actualID).toBe(FORMATTED_ID);
	});

	test('Resolve ID, with images', async () => {
		const url = 'https://video.kaltura.com/id/' + ID;

		const service = {
			getMetadataFor: () => {
				// meta object
				return Promise.resolve({
					contentLocation:
						'https://video.kaltura.com/media/Some+Title/' + ID,
					images: [
						{
							Class: 'ImageMetadata',
							MimeType:
								'application/vnd.nextthought.metadata.imagemetadata',
							url:
								'https://cdnapi.kaltura.com/p/' +
								PARTNER_ID +
								'/sp/55500/something/entry_id/' +
								ID,
						},
						{
							Class: 'ImageMetadata',
							MimeType:
								'application/vnd.nextthought.metadata.imagemetadata',
							url:
								'https://cdnapi.kaltura.com/p/' +
								PARTNER_ID +
								'/sp/55500/something/entry_id/' +
								ID,
						},
					],
				});
			},
		};

		const actualID = await Kaltura.resolveID(service, url);

		expect(actualID).toBe(FORMATTED_ID);
	});
});
