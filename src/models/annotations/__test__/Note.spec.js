import Note from '../Note';
import MockService from '../../__test__/mock-service';
import { Service } from '../../../constants';
// eslint-disable-next-line
import { ContentRangeDescription } from '../../anchors'; // This is imported for the registry to be able to parse the model in the notes

/* eslint-env jest */
describe('Annotations: Notes', () => {
	test('Correct create a note', () => {
		const parent = new Note(MockService, null, {
			'Creator': 'josh.birdwell@nextthought.com',
			'CreatedTime': 1539025456.772547,
			'Last Modified': 1539025456.787183,
			'NTIID': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c9b:5573657273:PN3eVkvXTTx',
			'MimeType': 'application/vnd.nextthought.note',
			'OID': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c9b:5573657273:PN3eVkvXTTx',
			'Links': [
				{
					'Class': 'Link',
					'href': '/dataserver2/LibraryPath?objectId=tag%3Anextthought.com%2C2011-10%3Ajosh.birdwell%40nextthought.com-OID-0x0573ea%3A5573657273%3APZxRH9WdTN1',
					'method': 'GET',
					'rel': 'LibraryPath'
				},
				{
					'Class': 'Link',
					'href': '/dataserver2/users/josh.birdwell@nextthought.com/tag:nextthought.com,2011-10:NTI-HTML-8211584329684854468/tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c9b:5573657273:PN3eVkvXTTx/mostRecentReply',
					'rel': 'mostRecentReply'
				},
				{
					'Class': 'Link',
					'href': '/dataserver2/users/josh.birdwell@nextthought.com/Objects/tag%3Anextthought.com%2C2011-10%3Ajosh.birdwell%40nextthought.com-OID-0x058c9b%3A5573657273%3APN3eVkvXTTx',
					'ntiid': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c9b:5573657273:PN3eVkvXTTx',
					'rel': 'edit'
				},
				{
					'Class': 'Link',
					'href': '/dataserver2/Objects/tag%3Anextthought.com%2C2011-10%3Ajosh.birdwell%40nextthought.com-OID-0x058c9b%3A5573657273%3APN3eVkvXTTx/@@replies/1B2M2Y8AsgTpgAmY7PhCfg',
					'ntiid': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c9b:5573657273:PN3eVkvXTTx',
					'rel': 'replies'
				},
				{
					'Class': 'Link',
					'href': '/dataserver2/Objects/tag%3Anextthought.com%2C2011-10%3Ajosh.birdwell%40nextthought.com-OID-0x058c9b%3A5573657273%3APN3eVkvXTTx/@@rate',
					'ntiid': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c9b:5573657273:PN3eVkvXTTx',
					'rel': 'rate'
				},
				{
					'Class': 'Link',
					'href': '/dataserver2/Objects/tag%3Anextthought.com%2C2011-10%3Ajosh.birdwell%40nextthought.com-OID-0x058c9b%3A5573657273%3APN3eVkvXTTx/@@flag',
					'ntiid': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c9b:5573657273:PN3eVkvXTTx',
					'rel': 'flag'
				},
				{
					'Class': 'Link',
					'href': '/dataserver2/Objects/tag%3Anextthought.com%2C2011-10%3Ajosh.birdwell%40nextthought.com-OID-0x058c9b%3A5573657273%3APN3eVkvXTTx/@@favorite',
					'ntiid': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c9b:5573657273:PN3eVkvXTTx',
					'rel': 'favorite'
				},
				{
					'Class': 'Link',
					'href': '/dataserver2/Objects/tag%3Anextthought.com%2C2011-10%3Ajosh.birdwell%40nextthought.com-OID-0x058c9b%3A5573657273%3APN3eVkvXTTx/@@like',
					'ntiid': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c9b:5573657273:PN3eVkvXTTx',
					'rel': 'like'
				},
				{
					'Class': 'Link',
					'href': '/dataserver2/users/josh.birdwell@nextthought.com/tag:nextthought.com,2011-10:NTI-HTML-8211584329684854468/tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c9b:5573657273:PN3eVkvXTTx/@@schema',
					'rel': 'schema'
				}
			],
			'href': '/dataserver2/users/josh.birdwell@nextthought.com/Objects/tag%3Anextthought.com%2C2011-10%3Ajosh.birdwell%40nextthought.com-OID-0x058c9b%3A5573657273%3APN3eVkvXTTx',
			'ContainerId': 'tag:nextthought.com,2011-10:NTI-HTML-8211584329684854468',
			'ID': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c9b:5573657273:PN3eVkvXTTx',
			'applicableRange': {
				'MimeType': 'application/vnd.nextthought.contentrange.contentrangedescription',
				'Class': 'ContentRangeDescription'
			},
			'sharedWith': [],
			'presentationProperties': null,
			'tags': [],
			'selectedText': '',
			'body': [
				'<html><body><p>test</p></body></html>'
			],
			'inReplyTo': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c93:5573657273:PN3eVkvXTTy',
			'references': [
				'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c7b:5573657273:PN3eVkvXTTz',
				'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c93:5573657273:PN3eVkvXTTy'
			],
			'ReferencedByCount': 0,
			'LikeCount': 0,
			'title': 'This is interesting',
			'style': 'suppressed'
		});
		let reply = new Note(MockService, parent, {
			'Class': 'Note',
			'MimeType': 'application/vnd.nextthought.note',
			'body': [
				'<p>test</p>'
			],
			'ContainerId': 'tag:nextthought.com,2011-10:NTI-HTML-8211584329684854468',
			'applicableRange': {
				'MimeType': 'application/vnd.nextthought.contentrange.contentrangedescription',
				'Class': 'ContentRangeDescription'
			},
			'inReplyTo': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c9b:5573657273:PN3eVkvXTTx',
			'references': [
				'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c7b:5573657273:PN3eVkvXTTz',
				'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c93:5573657273:PN3eVkvXTTy',
				'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c9b:5573657273:PN3eVkvXTTx'
			]
		});
		expect(reply.body).toEqual(['<p>test</p>']);
		expect(reply.inReplyTo).toBe('tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c9b:5573657273:PN3eVkvXTTx');
		expect(reply.MimeType).toBe('application/vnd.nextthought.note');
	});

	test('NTI-6782: postReply', async () => {
		let mockService = {
			isService: Service,
			getCollectionFor: () => ({
				href: '/dataserver2/++etc++hostsites/alpha.dev/++etc++site/Courses/DefaultAPICreated/reactjs/SubInstances/section%20001/Pages'
			}),
			post: jest.fn(function (target, data) {
				return {
					'Class': 'Note',
					'ContainerContext': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x04cfca:5573657273:WJZErypysH',
					'ContainerId': 'tag:nextthought.com,2011-10:NTI-HTML-8211584329684854468',
					'CreatedTime': 1539034870.323061,
					'Creator': 'josh.birdwell@nextthought.com',
					'ID': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058cb1:5573657273:PN3eVkvXTTu',
					'Last Modified': 1539034870.338479,
					'LikeCount': 0,
					'Links': [
						{
							'Class': 'Link',
							'href': '/dataserver2/LibraryPath?objectId=tag%3Anextthought.com%2C2011-10%3Ajosh.birdwell%40nextthought.com-OID-0x0573ea%3A5573657273%3APZxRH9WdTN1',
							'method': 'GET',
							'rel': 'LibraryPath'
						},
						{
							'Class': 'Link',
							'href': '/dataserver2/users/josh.birdwell@nextthought.com/tag:nextthought.com,2011-10:NTI-HTML-8211584329684854468/tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058cb1:5573657273:PN3eVkvXTTu/mostRecentReply',
							'rel': 'mostRecentReply'
						},
						{
							'Class': 'Link',
							'href': '/dataserver2/users/josh.birdwell@nextthought.com/Objects/tag%3Anextthought.com%2C2011-10%3Ajosh.birdwell%40nextthought.com-OID-0x058cb1%3A5573657273%3APN3eVkvXTTu',
							'ntiid': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058cb1:5573657273:PN3eVkvXTTu',
							'rel': 'edit'
						},
						{
							'Class': 'Link',
							'href': '/dataserver2/Objects/tag%3Anextthought.com%2C2011-10%3Ajosh.birdwell%40nextthought.com-OID-0x058cb1%3A5573657273%3APN3eVkvXTTu/@@replies/1B2M2Y8AsgTpgAmY7PhCfg',
							'ntiid': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058cb1:5573657273:PN3eVkvXTTu',
							'rel': 'replies'
						},
						{
							'Class': 'Link',
							'href': '/dataserver2/Objects/tag%3Anextthought.com%2C2011-10%3Ajosh.birdwell%40nextthought.com-OID-0x058cb1%3A5573657273%3APN3eVkvXTTu/@@rate',
							'ntiid': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058cb1:5573657273:PN3eVkvXTTu',
							'rel': 'rate'
						},
						{
							'Class': 'Link',
							'href': '/dataserver2/Objects/tag%3Anextthought.com%2C2011-10%3Ajosh.birdwell%40nextthought.com-OID-0x058cb1%3A5573657273%3APN3eVkvXTTu/@@flag',
							'ntiid': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058cb1:5573657273:PN3eVkvXTTu',
							'rel': 'flag'
						},
						{
							'Class': 'Link',
							'href': '/dataserver2/Objects/tag%3Anextthought.com%2C2011-10%3Ajosh.birdwell%40nextthought.com-OID-0x058cb1%3A5573657273%3APN3eVkvXTTu/@@favorite',
							'ntiid': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058cb1:5573657273:PN3eVkvXTTu',
							'rel': 'favorite'
						},
						{
							'Class': 'Link',
							'href': '/dataserver2/Objects/tag%3Anextthought.com%2C2011-10%3Ajosh.birdwell%40nextthought.com-OID-0x058cb1%3A5573657273%3APN3eVkvXTTu/@@like',
							'ntiid': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058cb1:5573657273:PN3eVkvXTTu',
							'rel': 'like'
						},
						{
							'Class': 'Link',
							'href': '/dataserver2/users/josh.birdwell@nextthought.com/tag:nextthought.com,2011-10:NTI-HTML-8211584329684854468/tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058cb1:5573657273:PN3eVkvXTTu/@@schema',
							'rel': 'schema'
						}
					],
					'MimeType': 'application/vnd.nextthought.note',
					'NTIID': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058cb1:5573657273:PN3eVkvXTTu',
					'OID': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058cb1:5573657273:PN3eVkvXTTu',
					'RecursiveLikeCount': 0,
					'ReferencedByCount': 0,
					'applicableRange': {
						'Class': 'ContentRangeDescription',
						'MimeType': 'application/vnd.nextthought.contentrange.contentrangedescription'
					},
					'body': [
						'<html><body><p>test</p></body></html>'
					],
					'containerId': 'tag:nextthought.com,2011-10:NTI-HTML-8211584329684854468',
					'href': '/dataserver2/users/josh.birdwell@nextthought.com/Objects/tag%3Anextthought.com%2C2011-10%3Ajosh.birdwell%40nextthought.com-OID-0x058cb1%3A5573657273%3APN3eVkvXTTu',
					'inReplyTo': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c7b:5573657273:PN3eVkvXTTz',
					'presentationProperties': null,
					'references': [
						'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c7b:5573657273:PN3eVkvXTTz'
					],
					'selectedText': '',
					'sharedWith': [],
					'style': 'suppressed',
					'tags': [],
					'title': 'This is interesting'
				};
			})
		};
		const spy = jest.spyOn(mockService, 'post');
		const parent = new Note(mockService, null, {
			'Creator': 'josh.birdwell@nextthought.com',
			'CreatedTime': 1539021918.528211,
			'Last Modified': 1539021918.543354,
			'NTIID': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c7b:5573657273:PN3eVkvXTTz',
			'MimeType': 'application/vnd.nextthought.note',
			'OID': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c7b:5573657273:PN3eVkvXTTz',
			'Links': [
				{
					'Class': 'Link',
					'href': '/dataserver2/LibraryPath?objectId=tag%3Anextthought.com%2C2011-10%3Ajosh.birdwell%40nextthought.com-OID-0x0573ea%3A5573657273%3APZxRH9WdTN1',
					'method': 'GET',
					'rel': 'LibraryPath'
				},
				{
					'Class': 'Link',
					'href': '/dataserver2/users/josh.birdwell@nextthought.com/tag:nextthought.com,2011-10:NTI-HTML-8211584329684854468/tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c7b:5573657273:PN3eVkvXTTz/mostRecentReply',
					'rel': 'mostRecentReply'
				},
				{
					'Class': 'Link',
					'href': '/dataserver2/users/josh.birdwell@nextthought.com/Objects/tag%3Anextthought.com%2C2011-10%3Ajosh.birdwell%40nextthought.com-OID-0x058c7b%3A5573657273%3APN3eVkvXTTz',
					'ntiid': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c7b:5573657273:PN3eVkvXTTz',
					'rel': 'edit'
				},
				{
					'Class': 'Link',
					'href': '/dataserver2/Objects/tag%3Anextthought.com%2C2011-10%3Ajosh.birdwell%40nextthought.com-OID-0x058c7b%3A5573657273%3APN3eVkvXTTz/@@replies/1B2M2Y8AsgTpgAmY7PhCfg',
					'ntiid': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c7b:5573657273:PN3eVkvXTTz',
					'rel': 'replies'
				},
				{
					'Class': 'Link',
					'href': '/dataserver2/Objects/tag%3Anextthought.com%2C2011-10%3Ajosh.birdwell%40nextthought.com-OID-0x058c7b%3A5573657273%3APN3eVkvXTTz/@@rate',
					'ntiid': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c7b:5573657273:PN3eVkvXTTz',
					'rel': 'rate'
				},
				{
					'Class': 'Link',
					'href': '/dataserver2/Objects/tag%3Anextthought.com%2C2011-10%3Ajosh.birdwell%40nextthought.com-OID-0x058c7b%3A5573657273%3APN3eVkvXTTz/@@flag',
					'ntiid': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c7b:5573657273:PN3eVkvXTTz',
					'rel': 'flag'
				},
				{
					'Class': 'Link',
					'href': '/dataserver2/Objects/tag%3Anextthought.com%2C2011-10%3Ajosh.birdwell%40nextthought.com-OID-0x058c7b%3A5573657273%3APN3eVkvXTTz/@@favorite',
					'ntiid': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c7b:5573657273:PN3eVkvXTTz',
					'rel': 'favorite'
				},
				{
					'Class': 'Link',
					'href': '/dataserver2/Objects/tag%3Anextthought.com%2C2011-10%3Ajosh.birdwell%40nextthought.com-OID-0x058c7b%3A5573657273%3APN3eVkvXTTz/@@like',
					'ntiid': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c7b:5573657273:PN3eVkvXTTz',
					'rel': 'like'
				},
				{
					'Class': 'Link',
					'href': '/dataserver2/users/josh.birdwell@nextthought.com/tag:nextthought.com,2011-10:NTI-HTML-8211584329684854468/tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c7b:5573657273:PN3eVkvXTTz/@@schema',
					'rel': 'schema'
				}
			],
			'href': '/dataserver2/users/josh.birdwell@nextthought.com/Objects/tag%3Anextthought.com%2C2011-10%3Ajosh.birdwell%40nextthought.com-OID-0x058c7b%3A5573657273%3APN3eVkvXTTz',
			'ContainerId': 'tag:nextthought.com,2011-10:NTI-HTML-8211584329684854468',
			'ID': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c7b:5573657273:PN3eVkvXTTz',
			'applicableRange': {
				'MimeType': 'application/vnd.nextthought.contentrange.contentrangedescription',
				'Class': 'ContentRangeDescription'
			},
			'sharedWith': [],
			'presentationProperties': null,
			'tags': [],
			'selectedText': 'I would recommend reaching for Context when you find yourself passing props down through three or more levels in your component tree. You might notice that you have renamed your props, making it challenging to determine the data’s origin. You might consider implementing context if a bunch of your components know about irrelevant data.',
			'body': [
				'<html><body><p>asdf asdfj welrjlwer</p></body></html>'
			],
			'inReplyTo': null,
			'references': [],
			'ReferencedByCount': null,
			'LikeCount': 0,
			'title': 'This is interesting',
			'style': 'suppressed'
		});
		const reply = new Note(mockService, parent, {
			'MimeType': 'application/vnd.nextthought.note',
			'ContainerId': 'tag:nextthought.com,2011-10:NTI-HTML-8211584329684854468',
			'applicableRange': {
				'MimeType': 'application/vnd.nextthought.contentrange.contentrangedescription',
				'Class': 'ContentRangeDescription'
			},
			'body': [
				'<p>test</p>'
			],
			'inReplyTo': 'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c7b:5573657273:PN3eVkvXTTz',
			'references': [
				'tag:nextthought.com,2011-10:josh.birdwell@nextthought.com-OID-0x058c7b:5573657273:PN3eVkvXTTz'
			]
		});
		const target = '/dataserver2/++etc++hostsites/alpha.dev/++etc++site/Courses/DefaultAPICreated/reactjs/SubInstances/section%20001/Pages';
		await parent.postReply(['<p>test</p>']);
		expect(spy).toHaveBeenCalled();
		expect(spy).toHaveBeenCalledWith(target, reply.getData());
	});
});
