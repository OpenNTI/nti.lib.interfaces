/* eslint-env jest */
import MediaSource from '../MediaSource';
import MediaSourceFactory from '../MediaSourceFactory';
import { getMetaDataEntryPoint } from '../providers/vimeo';
import MockService from '../../__test__/mock-service';

describe('MediaSourceFactory tests', () => {
	const FAKE_SERVICE = MockService;

	describe('YouTube', () => {
		test('Should construct a MediaSource for YouTube', async () => {
			const source = await MediaSource.from(
				FAKE_SERVICE,
				'https://www.youtube.com/watch?v=QH2-TGUlwu4'
			);

			expect(source.service).toBe('youtube');
			expect(source.source).toBe('QH2-TGUlwu4');
		});

		test('Should construct a MediaSource for YouTube', async () => {
			const source = await MediaSourceFactory.from(
				FAKE_SERVICE,
				'https://www.youtube.com/watch?v=QH2-TGUlwu4'
			);

			expect(source.service).toBe('youtube');
			expect(source.source).toBe('QH2-TGUlwu4');
		});
	});

	describe('Vimeo', () => {
		const VIMEO_CUSTOM_URL =
			'https://vimeo.com/carolbloom/meet-carol-bloom';
		const originalFetch = global.fetch;

		beforeEach(() => {
			global.fetch = uri => {
				if (uri === getMetaDataEntryPoint(VIMEO_CUSTOM_URL)) {
					return Promise.resolve({
						ok: true,
						json: () => Promise.resolve({ video_id: '204109308' }),
					});
				}

				return Promise.reject();
			};
		});

		afterEach(() => {
			global.fetch = originalFetch;
		});

		test('Should construct a MediaSource for Vimeo', async () => {
			const source = await MediaSourceFactory.from(
				FAKE_SERVICE,
				'https://vimeo.com/38195013'
			);

			expect(source.service).toBe('vimeo');
			expect(source.source).toBe('38195013');
		});

		test('Should construct a MediaSource for Vimeo', async () => {
			const source = await MediaSource.from(
				FAKE_SERVICE,
				'https://vimeo.com/38195013'
			);

			expect(source.service).toBe('vimeo');
			expect(source.source).toBe('38195013');
		});

		test('Should construct a MediaSource for Custom Vimeo URL', async () => {
			const source = await MediaSourceFactory.from(
				FAKE_SERVICE,
				VIMEO_CUSTOM_URL
			);

			expect(source.service).toBe('vimeo');
			expect(source.source).toBe('204109308');
		});

		test('Should construct a MediaSource for Custom Vimeo URL', async () => {
			const source = await MediaSource.from(
				FAKE_SERVICE,
				VIMEO_CUSTOM_URL
			);

			expect(source.service).toBe('vimeo');
			expect(source.source).toBe('204109308');
		});
	});

	describe('Kaltura', () => {
		test('Should construct a MediaSource for Kaltura', async () => {
			const source = await MediaSourceFactory.from(
				FAKE_SERVICE,
				'kaltura://providerId/entryId'
			);

			expect(source.service).toBe('kaltura');
			expect(source.source).toBe('providerId:entryId');
		});

		test('Should construct a MediaSource for Kaltura', async () => {
			const source = await MediaSource.from(
				FAKE_SERVICE,
				'kaltura://providerId/entryId'
			);

			expect(source.service).toBe('kaltura');
			expect(source.source).toBe('providerId:entryId');
		});
	});

	describe('HTML5 Raw sources', () => {
		test('Should construct a MediaSource for a file', async () => {
			const source = await MediaSourceFactory.from(
				FAKE_SERVICE,
				'http://nextthought.com/nyancat.mp4'
			);
			expect(source).toBeUndefined(); //this is expected at the moment...
		});

		test('Should construct a MediaSource for a file', async () => {
			const source = await MediaSource.from(
				FAKE_SERVICE,
				'http://nextthought.com/nyancat.mp4'
			);
			expect(source).toBeUndefined(); //this is expected at the moment...
		});
	});
});
