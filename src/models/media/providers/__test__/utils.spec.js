/* eslint-env jest */
import { getVideo } from '../utils.js';

test('getVideoID', () => {
	expect(getVideo('//vimeo.com/11111111')).toMatchInlineSnapshot(`
		Object {
		  "id": "11111111",
		  "service": "vimeo",
		}
	`);

	expect(getVideo('https://www.youtube.com/watch?v=4_kYLIdsSoQ'))
		.toMatchInlineSnapshot(`
		Object {
		  "id": "4_kYLIdsSoQ",
		  "service": "youtube",
		}
	`);
});
