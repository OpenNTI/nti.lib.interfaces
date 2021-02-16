/* eslint-env jest */
import PurchaseAttempt from '../PurchaseAttempt';
import MockService from '../../__test__/mock-service';
import '../../index'; //load all the models

const data = {
	ChargeID: null,
	Class: 'PurchaseAttempt',
	CreatedTime: 1504015417.986612,
	Creator: 'cory.jones@nextthought.com',
	Description: null,
	EndTime: null,
	Error: null,
	ID:
		'tag:nextthought.com,2011-10:cory.jones@nextthought.com-OID-0x25d464:5573657273:sj8b7VhdTgA',
	'Last Modified': 0,
	MimeType: 'application/vnd.nextthought.store.purchaseattempt',
	NTIID:
		'tag:nextthought.com,2011-10:cory.jones@nextthought.com-OID-0x25d464:5573657273:sj8b7VhdTgA',
	OID:
		'tag:nextthought.com,2011-10:cory.jones@nextthought.com-OID-0x25d464:5573657273:sj8b7VhdTgA',
	Order: {
		Class: 'StripePurchaseOrder',
		Coupon: null,
		Items: [
			{
				Class: 'StripePurchaseItem',
				Coupon: null,
				Items: [
					{
						AdditionalProperties: null,
						CatalogFamilies: {
							Class: 'CatalogFamilies',
							Items: [
								{
									CatalogFamilyID: 'CQQn+ymUxOUTswQUir2Zrw==',
									Class: 'CatalogFamily',
									Description:
										'History is about more than the people, events and ideas of the past. It’s a tool that\r\nhelps us understand what factors have shaped our present and informs us in making\r\ndecisions about the future. This course will introduce you to important aspects of\r\nthe social, political, economic and cultural history of the US since\r\nReconstruction. The topics are organized chronologically, and will address a\r\nnumber of recurring themes, such as the role of government, issues of identity, the\r\nconcept of culture, and America’s relationship to the outside world. We will draw\r\nfrom primary and secondary resources and examine US history through a variety of\r\nperspectives. Course lectures, readings, discussions, and activities will require active\r\nparticipation from students and will encourage reflection and self-exploration.',
									EndDate: '2016-07-09T04:59:00Z',
									MimeType:
										'application/vnd.nextthought.catalogfamily',
									PlatformPresentationResources: [
										{
											Class:
												'DisplayablePlatformPresentationResources',
											CreatedTime: 1496172392,
											InheritPlatformName: 'shared',
											'Last Modified': 1452118701,
											PlatformName: 'iPad',
											Version: 1,
											href:
												'/content/sites/platform.ou.edu/Courses/Summer2016/LSTD%201153%20Block%20B/presentation-assets/iPad/v1/',
										},
										{
											Class:
												'DisplayablePlatformPresentationResources',
											CreatedTime: 1496172392,
											InheritPlatformName: null,
											'Last Modified': 1452118704,
											PlatformName: 'shared',
											Version: 1,
											href:
												'/content/sites/platform.ou.edu/Courses/Summer2016/LSTD%201153%20Block%20B/presentation-assets/shared/v1/',
										},
										{
											Class:
												'DisplayablePlatformPresentationResources',
											CreatedTime: 1496172392,
											InheritPlatformName: 'shared',
											'Last Modified': 1452118702,
											PlatformName: 'webapp',
											Version: 1,
											href:
												'/content/sites/platform.ou.edu/Courses/Summer2016/LSTD%201153%20Block%20B/presentation-assets/webapp/v1/',
										},
									],
									ProviderDepartmentTitle:
										'University of Oklahoma',
									ProviderUniqueID: 'LSTD 1153',
									StartDate: '2016-06-13T05:00:00Z',
									Title:
										'A History of the United States (June 13)',
								},
							],
							MimeType:
								'application/vnd.nextthought.catalogfamilies',
						},
						Class: 'CourseCatalogLegacyEntry',
						ContentPackageNTIID:
							'tag:nextthought.com,2011-10:OU-HTML-OU_LSTD_1153_701_SU_2016_A_History_of_the_United_States.a_history_of_the_united_states',
						CourseNTIID:
							'tag:nextthought.com,2011-10:system-OID-0x0a0f08:5573657273:eJy72UE9Nvy',
						CreatedTime: 0,
						Credit: [
							{
								Class: 'CourseCreditLegacyInfo',
								Enrollment: {
									label: '',
									url: '',
								},
								Hours: 3,
								MimeType:
									'application/vnd.nextthought.courses.coursecreditlegacyinfo',
							},
						],
						DCCreator: [],
						DCDescription:
							'History is about more than the people, events and ideas of the past. It’s a tool that\r\nhelps us understand what factors have shaped our present and informs us in making\r\ndecisions about the future. This course will introduce you to important aspects of\r\nthe social, political, economic and cultural history of the US since\r\nReconstruction. The topics are organized chronologically, and will address a\r\nnumber of recurring themes, such as the role of government, issues of identity, the\r\nconcept of culture, and America’s relationship to the outside world. We will draw\r\nfrom primary and secondary resources and examine US history through a variety of\r\nperspectives. Course lectures, readings, discussions, and activities will require active\r\nparticipation from students and will encourage reflection and self-exploration.',
						DCTitle: 'A History of the United States (June 13)',
						Description:
							'History is about more than the people, events and ideas of the past. It’s a tool that\r\nhelps us understand what factors have shaped our present and informs us in making\r\ndecisions about the future. This course will introduce you to important aspects of\r\nthe social, political, economic and cultural history of the US since\r\nReconstruction. The topics are organized chronologically, and will address a\r\nnumber of recurring themes, such as the role of government, issues of identity, the\r\nconcept of culture, and America’s relationship to the outside world. We will draw\r\nfrom primary and secondary resources and examine US history through a variety of\r\nperspectives. Course lectures, readings, discussions, and activities will require active\r\nparticipation from students and will encourage reflection and self-exploration.',
						DisableOverviewCalendar: false,
						Duration: 'P28D',
						EndDate: '2016-07-09T04:59:00Z',
						EnrollmentOptions: {
							Class: 'EnrollmentOptions',
							Items: {
								FiveminuteEnrollment: {
									AllowVendorUpdates: true,
									CRN: '20897',
									Class: 'FiveminuteEnrollment',
									CourseTypeDisplayName: 'Fully Online',
									DropCutOffDate: null,
									Enabled: false,
									EnrollCutOffDate: '2016-06-15T04:59:00',
									IsAvailable: false,
									IsEnrolled: false,
									Links: [
										{
											Class: 'Link',
											href:
												'/dataserver2/janux/fmaep_course_details?Term=201530&CRN=20897',
											method: 'GET',
											rel: 'fmaep.course.details',
										},
									],
									MimeType:
										'application/vnd.nextthought.courseware.fiveminuteenrollmentoption',
									NTI_CRN: '20897',
									NTI_FiveminuteEnrollmentCapable: true,
									NTI_Term: '201530',
									OU_AllowVendorUpdates: true,
									OU_CourseTypeDisplayName: 'Fully Online',
									OU_DropCutOffDate: null,
									OU_EnrollCutOffDate: '2016-06-15T04:59:00',
									OU_Price: 449,
									OU_RefundCutOffDate: null,
									Price: 449,
									RefundCutOffDate: null,
									RequiresAdmission: true,
									Term: '201530',
								},
								OpenEnrollment: {
									Class: 'OpenEnrollment',
									Enabled: false,
									IsAvailable: false,
									IsEnrolled: false,
									MimeType:
										'application/vnd.nextthought.courseware.openenrollmentoption',
								},
								StoreEnrollment: {
									AllowVendorUpdates: true,
									Class: 'StoreEnrollment',
									Enabled: true,
									IsAvailable: true,
									IsEnrolled: false,
									MimeType:
										'application/vnd.nextthought.courseware.storeenrollmentoption',
									Purchasables: {
										DefaultGiftingNTIID:
											'tag:nextthought.com,2011-10:NTI-purchasable_course-Summer2016_LSTD_1153_Block_B',
										DefaultPurchaseNTIID:
											'tag:nextthought.com,2011-10:NTI-purchasable_course-Summer2016_LSTD_1153_Block_B',
										Items: [
											{
												Activated: false,
												Amount: 149,
												Author: null,
												BulkPurchase: false,
												Class: 'PurchasableCourse',
												Creator:
													'zope.security.management.system_user',
												Currency: 'USD',
												Discountable: false,
												Fee: null,
												Giftable: true,
												ID:
													'tag:nextthought.com,2011-10:NTI-purchasable_course-Summer2016_LSTD_1153_Block_B',
												IsPurchasable: true,
												Items: [
													'tag:nextthought.com,2011-10:NTI-CourseInfo-Summer2016_LSTD_1153_Block_B',
												],
												Links: [
													{
														Class: 'Link',
														href:
															'/dataserver2/store/@@get_purchase_history?ntiid=tag%253Anextthought.com%252C2011-10%253ANTI-purchasable_course-Summer2016_LSTD_1153_Block_B',
														method: 'GET',
														rel: 'history',
													},
													{
														Class: 'Link',
														href:
															'/dataserver2/store/@@price_purchasable',
														method: 'POST',
														rel: 'price',
													},
													{
														Class: 'Link',
														href:
															'/dataserver2/store/@@price_purchasable',
														method: 'POST',
														rel:
															'price_purchasable',
													},
													{
														Class: 'Link',
														href:
															'/dataserver2/store/@@redeem_gift',
														method: 'POST',
														rel: 'redeem_gift',
													},
													{
														Class: 'Link',
														href:
															'/dataserver2/store//stripe/@@create_token',
														method: 'POST',
														rel:
															'create_stripe_token',
													},
													{
														Class: 'Link',
														href:
															'/dataserver2/store//stripe/@@get_connect_key?provider=Janux',
														method: 'GET',
														rel:
															'get_stripe_connect_key',
													},
													{
														Class: 'Link',
														href:
															'/dataserver2/store//stripe/@@price_purchasable',
														method: 'POST',
														rel:
															'price_purchasable_with_stripe_coupon',
													},
													{
														Class: 'Link',
														href:
															'/dataserver2/store//stripe/@@post_payment',
														method: 'POST',
														rel:
															'post_stripe_payment',
													},
													{
														Class: 'Link',
														href:
															'/dataserver2/store//stripe/@@gift_payment',
														method: 'POST',
														rel:
															'gift_stripe_payment',
													},
													{
														Class: 'Link',
														href:
															'/dataserver2/store//purchasables/tag%3Anextthought.com%2C2011-10%3ANTI-purchasable_course-Summer2016_LSTD_1153_Block_B/@@disable',
														method: 'POST',
														rel: 'disable',
													},
													{
														Class: 'Link',
														href:
															'/dataserver2/store//purchasables/tag%3Anextthought.com%2C2011-10%3ANTI-purchasable_course-Summer2016_LSTD_1153_Block_B',
														method: 'POST',
														rel: 'edit',
													},
												],
												MimeType:
													'application/vnd.nextthought.store.purchasablecourse',
												NTIID:
													'tag:nextthought.com,2011-10:NTI-purchasable_course-Summer2016_LSTD_1153_Block_B',
												Name:
													'A History of the United States (June 13)',
												OID:
													'tag:nextthought.com,2011-10:zope.security.management.system_user-OID-0x0a0fc9:5573657273:eJy72UE9Nug',
												Payments: {
													stripe: {
														Alias: 'Janux',
														Class:
															'StripeConnectKey',
														LiveMode: false,
														MimeType:
															'application/vnd.nextthought.store.stripeconnectkey',
														Processor: 'stripe',
														Provider: 'Janux',
														PublicKey:
															'pk_test_LIpQyLD7p5FmspOs6pPW9gWG',
														StripeUserID:
															'ca_1FSb6y5t7qj6DPOCQjEApTbc5Ou6XCHx',
													},
												},
												Provider: 'Janux',
												PurchaseCutOffDate: null,
												RedeemCutOffDate: null,
												Redeemable: true,
												StripeConnectKey: {
													Alias: 'Janux',
													Class: 'StripeConnectKey',
													LiveMode: false,
													MimeType:
														'application/vnd.nextthought.store.stripeconnectkey',
													Processor: 'stripe',
													Provider: 'Janux',
													PublicKey:
														'pk_test_LIpQyLD7p5FmspOs6pPW9gWG',
													StripeUserID:
														'ca_1FSb6y5t7qj6DPOCQjEApTbc5Ou6XCHx',
												},
												Title:
													'A History of the United States (June 13)',
												VendorInfo: {
													AllowVendorUpdates: true,
													CRN: 20897,
													Duration: 'P28D',
													EndDate:
														'2016-07-09T04:59:00Z',
													MimeType:
														'application/vnd.nextthought.store.purchasablevendorinfo',
													Hours: 3,
													StartDate:
														'2016-06-13T05:00:00Z',
													Term: 201530,
													Title:
														'A History of the United States (June 13)',
												},
											},
										],
									},
									RequiresAdmission: false,
								},
							},
							MimeType:
								'application/vnd.nextthought.courseware.enrollmentoptions',
						},
						Instructors: [
							{
								Class: 'CourseCatalogInstructorLegacyInfo',
								JobTitle:
									'Professor of History at the University of Oklahoma and Scholar-in-Residence at HISTORY Channel',
								MimeType:
									'application/vnd.nextthought.courses.coursecataloginstructorlegacyinfo',
								Name: 'Steve Gillon',
								Suffix: null,
								Title: null,
								defaultphoto: null,
								username: '',
							},
						],
						'Last Modified': 1452118704,
						LegacyPurchasableIcon:
							'/content/sites/platform.ou.edu/OU_LSTD_1153_701_SU_2016_A_History_of_the_United_States/images/LSTD1153_promo.png',
						LegacyPurchasableThumbnail:
							'/content/sites/platform.ou.edu/OU_LSTD_1153_701_SU_2016_A_History_of_the_United_States/images/LSTD1153_cover.png',
						Links: [
							{
								Class: 'Link',
								href:
									'/dataserver2/++etc++hostsites/platform.ou.edu/++etc++site/Courses/Summer2016/LSTD%201153%20Block%20B',
								rel: 'CourseInstance',
							},
							{
								Class: 'Link',
								href:
									'/dataserver2/++etc++hostsites/platform.ou.edu/++etc++site/Courses/Summer2016/LSTD%201153%20Block%20B/CourseCatalogEntry/@@SyncLock',
								ntiid:
									'tag:nextthought.com,2011-10:NTI-CourseInfo-Summer2016_LSTD_1153_Block_B',
								rel: 'SyncLock',
							},
							{
								Class: 'Link',
								href:
									'/dataserver2/++etc++hostsites/platform.ou.edu/++etc++site/Courses/Summer2016/LSTD%201153%20Block%20B/CourseCatalogEntry/@@audit_log',
								ntiid:
									'tag:nextthought.com,2011-10:NTI-CourseInfo-Summer2016_LSTD_1153_Block_B',
								rel: 'audit_log',
							},
							{
								Class: 'Link',
								href:
									'/dataserver2/++etc++hostsites/platform.ou.edu/++etc++site/Courses/Summer2016/LSTD%201153%20Block%20B/CourseCatalogEntry/@@trim_log',
								method: 'POST',
								ntiid:
									'tag:nextthought.com,2011-10:NTI-CourseInfo-Summer2016_LSTD_1153_Block_B',
								rel: 'trim_log',
							},
							{
								Class: 'Link',
								href:
									'/dataserver2/++etc++hostsites/platform.ou.edu/++etc++site/Courses/Summer2016/LSTD%201153%20Block%20B/CourseCatalogEntry/@@clear_log',
								method: 'POST',
								ntiid:
									'tag:nextthought.com,2011-10:NTI-CourseInfo-Summer2016_LSTD_1153_Block_B',
								rel: 'clear_log',
							},
							{
								Class: 'Link',
								href:
									'/dataserver2/++etc++hostsites/platform.ou.edu/++etc++site/Courses/Summer2016/LSTD%201153%20Block%20B/CourseCatalogEntry',
								ntiid:
									'tag:nextthought.com,2011-10:NTI-CourseInfo-Summer2016_LSTD_1153_Block_B',
								rel: 'edit',
							},
							{
								Class: 'Link',
								href:
									'/dataserver2/++etc++hostsites/platform.ou.edu/++etc++site/Courses/Summer2016/LSTD%201153%20Block%20B/CourseCatalogEntry/@@Assignments',
								ntiid:
									'tag:nextthought.com,2011-10:NTI-CourseInfo-Summer2016_LSTD_1153_Block_B',
								rel: 'Assignments',
							},
							{
								Class: 'Link',
								href:
									'/dataserver2/++etc++hostsites/platform.ou.edu/++etc++site/Courses/Summer2016/LSTD%201153%20Block%20B/CourseCatalogEntry/@@Inquiries',
								ntiid:
									'tag:nextthought.com,2011-10:NTI-CourseInfo-Summer2016_LSTD_1153_Block_B',
								rel: 'Inquiries',
							},
							{
								Class: 'Link',
								href:
									'/dataserver2/++etc++hostsites/platform.ou.edu/++etc++site/Courses/Summer2016/LSTD%201153%20Block%20B/CourseCatalogEntry/@@AssessmentItems',
								ntiid:
									'tag:nextthought.com,2011-10:NTI-CourseInfo-Summer2016_LSTD_1153_Block_B',
								rel: 'AssessmentItems',
							},
							{
								Class: 'Link',
								href:
									'/dataserver2/++etc++hostsites/platform.ou.edu/++etc++site/Courses/Summer2016/LSTD%201153%20Block%20B/CourseCatalogEntry/CourseEvaluations',
								ntiid:
									'tag:nextthought.com,2011-10:NTI-CourseInfo-Summer2016_LSTD_1153_Block_B',
								rel: 'CourseEvaluations',
							},
							{
								Class: 'Link',
								href:
									'/dataserver2/++etc++hostsites/platform.ou.edu/++etc++site/Courses/Summer2016/LSTD%201153%20Block%20B/CourseCatalogEntry/@@assets',
								ntiid:
									'tag:nextthought.com,2011-10:NTI-CourseInfo-Summer2016_LSTD_1153_Block_B',
								rel: 'assets',
							},
							{
								Class: 'Link',
								href:
									'/dataserver2/++etc++hostsites/platform.ou.edu/++etc++site/Courses/Summer2016/LSTD%201153%20Block%20B/CourseCatalogEntry/@@UserCoursePreferredAccess',
								ntiid:
									'tag:nextthought.com,2011-10:NTI-CourseInfo-Summer2016_LSTD_1153_Block_B',
								rel: 'UserCoursePreferredAccess',
							},
							{
								Class: 'Link',
								href:
									'/dataserver2/++etc++hostsites/platform.ou.edu/++etc++site/Courses/Summer2016/LSTD%201153%20Block%20B/CourseCatalogEntry/@@CourseCatalogFamilies',
								ntiid:
									'tag:nextthought.com,2011-10:NTI-CourseInfo-Summer2016_LSTD_1153_Block_B',
								rel: 'CourseCatalogFamilies',
							},
							{
								Class: 'Link',
								href:
									'/dataserver2/++etc++hostsites/platform.ou.edu/++etc++site/Courses/Summer2016/LSTD%201153%20Block%20B/CourseCatalogEntry/CourseDiscussions',
								ntiid:
									'tag:nextthought.com,2011-10:NTI-CourseInfo-Summer2016_LSTD_1153_Block_B',
								rel: 'CourseDiscussions',
							},
							{
								Class: 'Link',
								href:
									'/dataserver2/++etc++hostsites/platform.ou.edu/++etc++site/Courses/Summer2016/LSTD%201153%20Block%20B/CourseCatalogEntry/@@Export',
								method: 'GET',
								ntiid:
									'tag:nextthought.com,2011-10:NTI-CourseInfo-Summer2016_LSTD_1153_Block_B',
								rel: 'Export',
							},
							{
								Class: 'Link',
								href:
									'/dataserver2/++etc++hostsites/platform.ou.edu/++etc++site/Courses/Summer2016/LSTD%201153%20Block%20B/CourseCatalogEntry/@@Import',
								method: 'POST',
								ntiid:
									'tag:nextthought.com,2011-10:NTI-CourseInfo-Summer2016_LSTD_1153_Block_B',
								rel: 'Import',
							},
							{
								Class: 'Link',
								href:
									'/dataserver2/++etc++hostsites/platform.ou.edu/++etc++site/Courses/Summer2016/LSTD%201153%20Block%20B/CourseCatalogEntry',
								method: 'DELETE',
								ntiid:
									'tag:nextthought.com,2011-10:NTI-CourseInfo-Summer2016_LSTD_1153_Block_B',
								rel: 'delete',
							},
						],
						MimeType:
							'application/vnd.nextthought.courses.coursecataloglegacyentry',
						NTIID:
							'tag:nextthought.com,2011-10:NTI-CourseInfo-Summer2016_LSTD_1153_Block_B',
						OID:
							'tag:nextthought.com,2011-10:system-OID-0x12b159:5573657273',
						PlatformPresentationResources: [
							{
								Class:
									'DisplayablePlatformPresentationResources',
								CreatedTime: 1496172392,
								InheritPlatformName: 'shared',
								'Last Modified': 1452118701,
								PlatformName: 'iPad',
								Version: 1,
								href:
									'/content/sites/platform.ou.edu/Courses/Summer2016/LSTD%201153%20Block%20B/presentation-assets/iPad/v1/',
							},
							{
								Class:
									'DisplayablePlatformPresentationResources',
								CreatedTime: 1496172392,
								InheritPlatformName: null,
								'Last Modified': 1452118704,
								PlatformName: 'shared',
								Version: 1,
								href:
									'/content/sites/platform.ou.edu/Courses/Summer2016/LSTD%201153%20Block%20B/presentation-assets/shared/v1/',
							},
							{
								Class:
									'DisplayablePlatformPresentationResources',
								CreatedTime: 1496172392,
								InheritPlatformName: 'shared',
								'Last Modified': 1452118702,
								PlatformName: 'webapp',
								Version: 1,
								href:
									'/content/sites/platform.ou.edu/Courses/Summer2016/LSTD%201153%20Block%20B/presentation-assets/webapp/v1/',
							},
						],
						Prerequisites: [
							{
								id: '',
								title: 'None',
							},
						],
						Preview: true,
						ProviderDepartmentTitle: 'University of Oklahoma',
						ProviderDisplayName: 'LSTD 1153',
						ProviderUniqueID: 'LSTD 1153',
						RichDescription: '',
						Schedule: null,
						StartDate: '2016-06-13T05:00:00Z',
						Title: 'A History of the United States (June 13)',
						Video: 'vimeo://109968589',
						description:
							'History is about more than the people, events and ideas of the past. It’s a tool that\r\nhelps us understand what factors have shaped our present and informs us in making\r\ndecisions about the future. This course will introduce you to important aspects of\r\nthe social, political, economic and cultural history of the US since\r\nReconstruction. The topics are organized chronologically, and will address a\r\nnumber of recurring themes, such as the role of government, issues of identity, the\r\nconcept of culture, and America’s relationship to the outside world. We will draw\r\nfrom primary and secondary resources and examine US history through a variety of\r\nperspectives. Course lectures, readings, discussions, and activities will require active\r\nparticipation from students and will encourage reflection and self-exploration.',
						href:
							'/dataserver2/++etc++hostsites/platform.ou.edu/++etc++site/Courses/Summer2016/LSTD%201153%20Block%20B/CourseCatalogEntry',
						is_non_public: false,
						title: 'A History of the United States (June 13)',
					},
				],
				MimeType:
					'application/vnd.nextthought.store.stripepurchaseitem',
				NTIID:
					'tag:nextthought.com,2011-10:NTI-purchasable_course-Summer2016_LSTD_1153_Block_B',
				Quantity: 1,
			},
		],
		MimeType: 'application/vnd.nextthought.store.stripepurchaseorder',
		Quantity: null,
	},
	Pricing: null,
	Processor: 'stripe',
	StartTime: 1504015417.986612,
	State: 'Unknown',
	Synced: false,
	TokenID: null,
	TransactionID: 'sj8b7VhdTgA',
};

describe('PurchaseAttempt tests', () => {
	test('model parses correctly', () => {
		expect(
			() => new PurchaseAttempt(MockService, null, data)
		).not.toThrow();
	});
});
