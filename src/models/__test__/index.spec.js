/* eslint-env jest */
import '../index';
import Registry, {COMMON_PREFIX} from '../Registry';

const KNOWN = [
	'__base__',
	'link',
	'change',

	'community',
	'user',
	'friendslist',
	'dynamicfriendslist',
	'pageinfo',
	'sharingpagepreference',
	'SharingPagePreference',
	'suggestedcontacts',

	'badge',
	'openbadges.badge',
	'openbadges.issuer',
	'gradebookshell',

	'slide',
	'ntislidevideo',
	'ntislidedeck',

	'gradebook.gradebookbyassignmentsummary',
	'GradeBookByAssignmentSummary',
	'gradebook.userassignmentsummary',
	'gradebook.usergradebooksummary',

	'contentpackage',
	'renderablecontentpackage',
	'content.packagerenderjob',
	'contentpackagebundle',
	'coursecontentpackagebundle',
	'courseinstancesharingscopes',

	'ContentPackage',
	'ContentPackageBundle',
	'CourseInstanceSharingScopes',

	'contentfile',
	'contentfolder',
	'contentrootfolder',
	'contentblobfile',
	'courseware.contentfile',
	'courseware.contentfolder',
	'courserootfolder',
	'resources.courserootfolder',

	'ntitimeline',

	'mediasource',
	'videosource',
	'video',
	'ntivideo',
	'ntivideoref',

	'discussionref',
	'relatedworkref',
	'relatedworkrefpointer',

	'ntilessonoverview',
	'nticourseoverviewgroup',
	'videoroll',

	'courses.catalogentry',
	'courses.courseinstance',
	'courses.courseenrollment',

	'courseware.courserecursivestreambucket',
	'courseware.courserecursivestreambybucket',

	'courseware.enrollmentoptions',

	'courseware.enrollmentoption',
	'courseware.openenrollmentoption',
	'courseware.ozoneenrollmentoption',
	'courseware.fiveminuteenrollmentoption',
	'courseware.storeenrollmentoption',

	'courseware.courseinstanceadministrativerole',
	'courses.legacycommunitybasedcourseinstance',
	'courseware.courseinstanceenrollment',

	'courses.courseoutline',
	'courses.courseoutlinenode',
	'courses.courseoutlinecontentnode',
	'courses.courseoutlinecalendarnode',

	'courseoutlinenodeprogress',
	'CourseOutlineNodeProgress',
	'progresscontainer',

	'progress',
	'Progress',
	'videoprogress',

	'courses.coursecataloglegacyentry',
	'courseware.coursecataloglegacyentry',

	'courses.discussion',

	'assessment.assessedquestionset',
	'assessment.assessedquestion',
	'assessment.assessedpart',

	'questionset',
	'questionsetref',
	'naquestionset',
	'narandomizedquestionset',
	'naquestionbank',
	'question',
	'naquestion',
	'naquestionfillintheblankwordbank',

	'nasurvey',
	'napoll',
	'surveyref',
	'pollref',
	'assessment.pollsubmission',
	'assessment.surveysubmission',
	'assessment.aggregatedsurvey',
	'assessment.aggregatedpoll',

	'assignmentref',
	'assessment.assignment',
	'assessment.timedassignment',
	'assessment.discussionassignment',
	'assessment.userscourseassignmentmetadataitem',

	'assessment.assignmentpart',

	'assessment.randomizedquestionset',
	'assessment.fillintheblankwithwordbankquestion',

	'assessment.assignmentsubmission',
	'assessment.assignmentsubmissionpendingassessment',
	'assessment.questionsetsubmission',
	'assessment.questionsubmission',

	'assessment.response',
	'assessment.dictresponse',
	'assessment.textresponse',

	'assessment.part',
	'assessment.solution',

	'assessment.hint',
	'assessment.htmlhint',
	'assessment.texthint',

	'assessment.filepart',
	'assessment.fillintheblank',
	'assessment.fillintheblankshortanswerpart',
	'assessment.fillintheblankwithwordbankpart',
	'assessment.freeresponsepart',
	'assessment.matchingpart',
	'assessment.mathpart',
	'assessment.modeledcontentpart',
	'assessment.multiplechoicepart',
	'assessment.multiplechoicemultipleanswerpart',
	'assessment.randomizedmultiplechoicepart',
	'assessment.randomizedmultiplechoicemultipleanswerpart',
	'assessment.numericmathpart',
	'assessment.orderingpart',
	'assessment.symbolicmathpart',

	'assessment.nongradablefreeresponsepart',
	'assessment.nongradablematchingpart',
	'assessment.nongradablemodeledcontentpart',
	'assessment.nongradablemultiplechoicepart',
	'assessment.nongradablemultiplechoicemultipleanswerpart',
	'assessment.nongradableorderingpart',

	'assessment.aggregatedfreeresponsepart',
	'assessment.aggregatedmultiplechoicemultipleanswerpart',
	'assessment.aggregatedmultiplechoicepart',
	'assessment.aggregatedmatchingpart',
	'assessment.aggregatedorderingpart',
	'assessment.aggregatedmodeledcontentpart',

	'assessment.fillintheblankshortanswersolution',
	'assessment.fillintheblankwithwordbanksolution',
	'assessment.freeresponsesolution',
	'assessment.latexsymbolicmathsolution',
	'assessment.matchingsolution',
	'assessment.mathsolution',
	'assessment.multiplechoicemultipleanswersolution',
	'assessment.multiplechoicesolution',
	'assessment.numericmathsolution',
	'assessment.orderingsolution',
	'assessment.symbolicmathsolution',

	'assessment.inquiryitem',
	'assessment.userscourseinquiryitem',
	'assessment.userscourseinquiryitemresponse',
	'assessment.savepointitem',
	'assessment.userscourseassignmentsavepointitem',

	'assessment.questionbank',
	'assessment.questionmap',

	'naqwordbank',
	'naqwordentry',

	'grade',
	'gradebook.grade',
	'assessment.assignmenthistoryitem',
	'assessment.assignmenthistoryitemsummary',
	'assessment.userscourseassignmenthistoryitemsummary',
	'assessment.userscourseassignmenthistory',
	'assessment.userscourseassignmenthistoryitem',
	'assessment.userscourseassignmenthistoryitemfeedback',
	'assessment.userscourseassignmenthistoryitemfeedbackcontainer',

	'forums.board',
	'forums.topic',
	'forums.forum',
	'forums.post',
	'forums.comment',

	'forums.headlinepost',
	'forums.headlinetopic',

	'forums.communityboard',
	'forums.communityforum',
	'forums.communityheadlinetopic',
	'forums.communityheadlinepost',
	'forums.communitytopic',

	'forums.dflboard',
	'forums.dflforum',
	'forums.dflheadlinetopic',
	'forums.dflheadlinepost',
	'forums.dfltopic',

	'forums.personalblog',
	'forums.personalblogentry',
	'forums.personalblogentrypost',

	'forums.contentboard',
	'forums.contentforum',
	'forums.contentheadlinetopic',
	'forums.contentheadlinepost',

	'forums.generalforumcomment',
	'forums.contentforumcomment',
	'forums.personalblogcomment',

	'forums.usertopicparticipationsummary',
	'forums.usertopicparticipationcontext',

	'highlight',
	'note',
	'redaction',

	'contentrange.contentpointer',
	'contentrange.contentrangedescription',
	'contentrange.domcontentpointer',
	'contentrange.domcontentrangedescription',
	'contentrange.elementdomcontentpointer',
	'contentrange.textcontext',
	'contentrange.textdomcontentpointer',
	'contentrange.timecontentpointer',
	'contentrange.timerangedescription',
	'contentrange.transcriptcontentpointer',
	'contentrange.transcriptrangedescription',

	'profile.professionalposition',
	'profile.educationalexperiance',
	'profile.educationalexperience',

	'store.priceditem',
	'store.pricingresults',
	'store.purchasable',
	'store.purchasablecourse',
	'store.purchasablecoursechoicebundle',
	'store.purchaseattempt',
	'store.giftpurchaseattempt',
	'store.stripeconnectkey',
	'store.stripepricedpurchasable',
	'store.stripepurchaseitem',
	'store.stripepurchaseorder',

	'messageinfo',
	'_meeting',
	'transcript',
	'transcriptsummary',
];

describe('Builtin Models', () => {

	test('Validate Builtin models are resolvable', () => {

		for (let type of KNOWN) {
			const a = Registry.lookup(type); //short-hand
			const b = Registry.lookup(COMMON_PREFIX + type); //absolute

			expect(a).toBe(b);
			expect(a || b).toBeTruthy();
		}

	});

});
