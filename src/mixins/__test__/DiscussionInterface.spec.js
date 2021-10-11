/* eslint-env jest */

import DiscussionInterface, { getPayload } from '../DiscussionInterface.js';

test('DiscussionInterface statically defines getPayload', () => {
	expect(DiscussionInterface.getPayload).toBe(getPayload);
});

test("DiscussionInterface's updatePost does not blowup.", async () => {
	class Foo extends DiscussionInterface(
		class {
			static Fields = {};
			onChange() {}
			async save(data) {
				return data;
			}
		}
	) {}
	const post = new Foo();
	jest.spyOn(post, 'onChange');
	jest.spyOn(post, 'save');
	const args = [
		{ meh: true, body: ['howdy!'] },
		Symbol(1),
		Symbol(2),
		Symbol(3),
	];
	const data = await post.updatePost(...args);

	expect(data).toMatchInlineSnapshot(`
		Object {
		  "body": Array [
		    "howdy!",
		  ],
		  "meh": true,
		  "mentions": Array [],
		}
	`);

	expect(post.save).toHaveBeenCalledTimes(1);
	expect(post.save).toHaveBeenCalledWith(
		expect.objectContaining(args[0]),
		...args.slice(1)
	);
	expect(post.onChange).toHaveBeenCalledTimes(1);
	expect(post.onChange).toHaveBeenCalledWith();
});
