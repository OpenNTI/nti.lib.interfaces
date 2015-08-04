
import identity from '../utils/identity';

import User from './User';
import Community from './Community';
import FriendsList from './FriendsList';
import DynamicFriendsList from './DynamicFriendsList';
import PageInfo from './PageInfo';
import Change from './Change';

import RelatedWorkReference from './RelatedWorkReference';

//chat
import MessageInfo from './chat/MessageInfo';
import RoomInfo from './chat/RoomInfo';
import Transcript from './chat/Transcript';
import TranscriptSummary from './chat/TranscriptSummary';

// profile
import ProfessionalPosition from './profile/ProfessionalPosition';
import EducationalExperience from './profile/EducationalExperience';

import Highlight from './annotations/Highlight';
import Note from './annotations/Note';
import Redaction from './annotations/Redaction';

import ContentPointer from './anchors/ContentPointer';
import ContentRangeDescription from './anchors/ContentRangeDescription';
import DomContentPointer from './anchors/DomContentPointer';
import DomContentRangeDescription from './anchors/DomContentRangeDescription';
import ElementDomContentPointer from './anchors/ElementDomContentPointer';
import TextContext from './anchors/TextContext';
import TextDomContentPointer from './anchors/TextDomContentPointer';
import TimeContentPointer from './anchors/TimeContentPointer';
import TimeRangeDescription from './anchors/TimeRangeDescription';
import TranscriptContentPointer from './anchors/TranscriptContentPointer';
import TranscriptRangeDescription from './anchors/TranscriptRangeDescription';


import ContentPackage from './content/Package';
import ContentBundle from './content/Bundle';

import MediaSource from './MediaSource';
import Video from './Video';
import VideoRef from './VideoRef';
import VideoIndexBackedPageSource from './VideoIndexBackedPageSource';

import CourseCatalogEntry from './courses/CatalogEntry';
import CourseInstance from './courses/Instance';
import CourseAdministrativeRole from './courses/AdministrativeRole';
import CourseEnrollment from './courses/Enrollment';
import CourseEnrollmentOptions from './courses/EnrollmentOptions';
import CourseEnrollmentOption from './courses/EnrollmentOption';
import CourseEnrollmentOption5Minute from './courses/EnrollmentOption5Minute';
import CourseEnrollmentOptionPurchase from './courses/EnrollmentOptionPurchase';
import CourseOutline from './courses/Outline';
import CourseOutlineNode from './courses/OutlineNode';
import CourseOutlineNodeProgress from './courses/OutlineNodeProgress';

import CourseProgress from './courses/Progress';


import AssessmentQuestionSet from './assessment/QuestionSet';
import AssessmentQuestionSetRef from './assessment/QuestionSetReference';
import AssessmentQuestion from './assessment/Question';

import AssessmentSurvey from './assessment/Survey';
import AssessmentPoll from './assessment/Poll';

import AssessmentAssignmentRef from './assessment/AssignmentReference';
import AssessmentAssignment from './assessment/Assignment';
import AssessmentTimedAssignment from './assessment/TimedAssignment';
import AssessmentAssignmentPart from './assessment/AssignmentPart';

import AssessmentAssessedQuestionSet from './assessment/AssessedQuestionSet';
import AssessmentAssessedQuestion from './assessment/AssessedQuestion';
import AssessmentAssessedPart from './assessment/AssessedPart';

import AssessmentAssignmentSubmission from './assessment/AssignmentSubmission';
import AssessmentQuestionSetSubmission from './assessment/QuestionSetSubmission';
import AssessmentQuestionSubmission from './assessment/QuestionSubmission';

import AssessmentPollSubmittion from './assessment/PollSubmission';
import AssessmentSurveySubmittion from './assessment/SurveySubmission';

import AssessmentResponse from './assessment/Response';

import AssessmentPart from './assessment/Part';
import AssessmentSolution from './assessment/Solution';

import AssessmentHint from './assessment/Hint';

import AssessmentPartFile from './assessment/parts/File';
import AssessmentPartFillInTheBlank from './assessment/parts/FillInTheBlank';
import AssessmentPartMatching from './assessment/parts/Matching';
import AssessmentPartMultipleChoice from './assessment/parts/MultipleChoice';
import AssessmentPartOrdering from './assessment/parts/Ordering';

import AssessmentInquiryItem from './assessment/InquiryItem';
import AssessmentInquiryItemResponse from './assessment/InquiryItemResponse';
import AssessmentSavePointItem from './assessment/SavePointItem';

import AssessmentWordBank from './assessment/WordBank';
import AssessmentWordEntry from './assessment/WordEntry';

import AssessmentGrade from './assessment/Grade';
import AssessmentAssignmentHistoryItem from './assessment/AssignmentHistoryItem';
import AssessmentAssignmentFeedback from './assessment/AssignmentFeedback';
import AssessmentAssignmentFeedbackContainer from './assessment/AssignmentFeedbackContainer';

import ForumsBoard from './forums/Board';
import ForumsTopic from './forums/Topic';
import ForumsForum from './forums/Forum';
import ForumsPost from './forums/Post';
import ForumsComment from './forums/Comment';
import BlogEntry from './forums/BlogEntry';

import AssessmentEvent from './analytics/AssessmentEvent';
import AssignmentEvent from './analytics/AssignmentEvent';
import ResourceEvent from './analytics/ResourceEvent';
import ExternalResourceEvent from './analytics/ExternalResourceEvent';
import ProfileViewedEvent from './analytics/ProfileViewedEvent';
import ProfileActivityViewedEvent from './analytics/ProfileActivityViewedEvent';
import ProfileMembershipViewedEvent from './analytics/ProfileMembershipViewedEvent';
import TopicViewedEvent from './analytics/TopicViewedEvent';
import WatchVideoEvent from './analytics/WatchVideoEvent';

import PricedItem from './store/PricedItem';
import PricingResults from './store/PricingResults';
import Purchasable from './store/Purchasable';
import PurchasableCourse from './store/PurchasableCourse';
import PurchasableCourseChoiceBundle from './store/PurchasableCourseChoiceBundle';
import PurchaseAttempt from './store/PurchaseAttempt';
import GiftPurchaseAttempt from './store/GiftPurchaseAttempt';
import StripeConnectKey from './store/StripeConnectKey';
import StripePricedPurchasable from './store/StripePricedPurchasable';
import StripePurchaseItem from './store/StripePurchaseItem';
import StripePurchaseOrder from './store/StripePurchaseOrder';

const ignored = {parse: identity};

const PARSERS = {
	'link': ignored,
	'change': Change,

	'community': Community,
	'user': User,
	'friendslist': FriendsList,
	'dynamicfriendslist': DynamicFriendsList,
	'pageinfo': PageInfo,

	'ContentPackage': ContentPackage,
	'ContentPackageBundle': ContentBundle,

	'mediasource': MediaSource,
	'videosource': MediaSource,
	'video': Video,
	'ntivideo': 'video',
	'ntivideoref': VideoRef,

	'relatedworkref': RelatedWorkReference,

	'videoindex-pagesource': VideoIndexBackedPageSource,

	'analytics.externalresourceevent': ExternalResourceEvent,
	'analytics.assessmentevent': AssessmentEvent,
	'analytics.assignmentevent': AssignmentEvent,
	'analytics.resourceevent': ResourceEvent,
	'analytics.topicviewevent': TopicViewedEvent,
	'analytics.profileviewevent': ProfileViewedEvent,
	'analytics.profileactivityviewevent': ProfileActivityViewedEvent,
	'analytics.profilemembershipviewevent': ProfileMembershipViewedEvent,
	'analytics.watchvideoevent': WatchVideoEvent,

	'courses.catalogentry': CourseCatalogEntry,
	'courses.courseinstance': CourseInstance,
	'courses.courseenrollment': CourseEnrollment,

	'courseware.enrollmentoptions': CourseEnrollmentOptions,

	'courseware.enrollmentoption': CourseEnrollmentOption,
	'courseware.openenrollmentoption': 'courseware.enrollmentoption',
	'courseware.fiveminuteenrollmentoption': CourseEnrollmentOption5Minute,
	'courseware.storeenrollmentoption': CourseEnrollmentOptionPurchase,

	'courseware.courseinstanceadministrativerole': CourseAdministrativeRole,
	'courses.legacycommunitybasedcourseinstance': 'courses.courseinstance',
	'courseware.courseinstanceenrollment': 'courses.courseenrollment',

	'courses.courseoutline': CourseOutline,
	'courses.courseoutlinenode': CourseOutlineNode,
	'courses.courseoutlinecontentnode': 'courses.courseoutlinenode',
	'courses.courseoutlinecalendarnode': 'courses.courseoutlinenode',

	'courseoutlinenodeprogress': CourseOutlineNodeProgress,
	'CourseOutlineNodeProgress': 'courseoutlinenodeprogress',
	'progresscontainer': 'courseoutlinenodeprogress',

	'progress': CourseProgress,
	'Progress': 'progress',

	'courses.coursecataloglegacyentry': 'courses.catalogentry',//Really?! Two packages?! :P
	'courseware.coursecataloglegacyentry': 'courses.catalogentry',



	'assessment.assessedquestionset': AssessmentAssessedQuestionSet,
	'assessment.assessedquestion': AssessmentAssessedQuestion,
	'assessment.assessedpart': AssessmentAssessedPart,

	'questionset': AssessmentQuestionSet,
	'questionsetref': AssessmentQuestionSetRef,
	'naquestionset': 'questionset',
	'naquestionbank': 'questionset',
	'question': AssessmentQuestion,
	'naquestion': 'question',
	'naquestionfillintheblankwordbank': 'question',

	'nasurvey': AssessmentSurvey,
	'napoll': AssessmentPoll,
	'assessment.pollsubmission': AssessmentPollSubmittion,
	'assessment.surveysubmission': AssessmentSurveySubmittion,

	'assessmentref': AssessmentAssignmentRef,
	'assessment.assignment': AssessmentAssignment,
	'assessment.timedassignment': AssessmentTimedAssignment,

	'assessment.assignmentpart': AssessmentAssignmentPart,

	'assessment.randomizedquestionset': 'questionset',
	'assessment.fillintheblankwithwordbankquestion': 'question',

	'assessment.assignmentsubmission': AssessmentAssignmentSubmission,
	'assessment.assignmentsubmissionpendingassessment': 'assessment.assignmentsubmission',
	'assessment.questionsetsubmission': AssessmentQuestionSetSubmission,
	'assessment.questionsubmission': AssessmentQuestionSubmission,

	'assessment.response': AssessmentResponse,
	'assessment.dictresponse': 'assessment.response',
	'assessment.textresponse': 'assessment.response',

	'assessment.part': AssessmentPart,
	'assessment.solution': AssessmentSolution,

	'assessment.hint': AssessmentHint,
	'assessment.htmlhint': 'assessment.hint',
	'assessment.texthint': 'assessment.hint',

	'assessment.filepart': AssessmentPartFile,
	'assessment.fillintheblank': AssessmentPartFillInTheBlank,
	'assessment.fillintheblankshortanswerpart': 'assessment.fillintheblank',
	'assessment.fillintheblankwithwordbankpart': 'assessment.fillintheblank',
	'assessment.freeresponsepart': 'assessment.part',
	'assessment.matchingpart': AssessmentPartMatching,
	'assessment.mathpart': 'assessment.part',
	'assessment.modeledcontentpart': 'assessment.part',
	'assessment.multiplechoicepart': AssessmentPartMultipleChoice,
	'assessment.multiplechoicemultipleanswerpart': 'assessment.multiplechoicepart',
	'assessment.randomizedmultiplechoicepart': 'assessment.multiplechoicepart',
	'assessment.randomizedmultiplechoicemultipleanswerpart': 'assessment.multiplechoicepart',
	'assessment.numericmathpart': 'assessment.part',
	'assessment.orderingpart': AssessmentPartOrdering,
	'assessment.symbolicmathpart': 'assessment.part',

	'assessment.nongradablefreeresponsepart': 'assessment.freeresponsepart',
	'assessment.nongradablematchingpart': 'assessment.matchingpart',
	'assessment.nongradablemodeledcontentpart': 'assessment.modeledcontentpart',
	'assessment.nongradablemultiplechoicepart': 'assessment.multiplechoicepart',
	'assessment.nongradablemultiplechoicemultipleanswerpart': 'assessment.multiplechoicepart',
	'assessment.nongradableorderingpart': 'assessment.orderingpart',

	'assessment.fillintheblankshortanswersolution': 'assessment.solution',
	'assessment.fillintheblankwithwordbanksolution': 'assessment.solution',
	'assessment.freeresponsesolution': 'assessment.solution',
	'assessment.latexsymbolicmathsolution': 'assessment.solution',
	'assessment.matchingsolution': 'assessment.solution',
	'assessment.mathsolution': 'assessment.solution',
	'assessment.multiplechoicemultipleanswersolution': 'assessment.solution',
	'assessment.multiplechoicesolution': 'assessment.solution',
	'assessment.numericmathsolution': 'assessment.solution',
	'assessment.orderingsolution': 'assessment.solution',
	'assessment.symbolicmathsolution': 'assessment.solution',

	'assessment.inquiryitem': AssessmentInquiryItem,
	'assessment.userscourseinquiryitem': 'assessment.inquiryitem',
	'assessment.userscourseinquiryitemresponse': AssessmentInquiryItemResponse,
	'assessment.savepointitem': AssessmentSavePointItem,
	'assessment.userscourseassignmentsavepointitem': 'assessment.savepointitem',

	'assessment.questionbank': ignored,
	'assessment.questionmap': ignored,

	'naqwordbank': AssessmentWordBank,
	'naqwordentry': AssessmentWordEntry,

	'grade': AssessmentGrade,
	'gradebook.grade': 'grade',
	'assessment.assignmenthistoryitem': AssessmentAssignmentHistoryItem,
	'assessment.userscourseassignmenthistoryitem': 'assessment.assignmenthistoryitem',
	'assessment.userscourseassignmenthistoryitemfeedback': AssessmentAssignmentFeedback,
	'assessment.userscourseassignmenthistoryitemfeedbackcontainer': AssessmentAssignmentFeedbackContainer,

	'forums.board': ForumsBoard,
	'forums.topic': ForumsTopic,
	'forums.forum': ForumsForum,
	'forums.post': ForumsPost,
	'forums.comment': ForumsComment,

	'forums.headlinepost': 'forums.post',
	'forums.headlinetopic': 'forums.topic',

	'forums.communityboard': 'forums.board',
	'forums.communityforum': 'forums.forum',
	'forums.communityheadlinetopic': 'forums.topic',
	'forums.communityheadlinepost': 'forums.post',
	'forums.communitytopic': 'forums.topic',

	'forums.personalblog': 'forums.board',
	'forums.personalblogentry': BlogEntry,
	'forums.personalblogentrypost': 'forums.post',

	'forums.contentboard': 'forums.board',
	'forums.contentforum': 'forums.forum',
	'forums.contentheadlinetopic': 'forums.topic',
	'forums.contentheadlinepost': 'forums.post',

	'forums.generalforumcomment': 'forums.comment',
	'forums.contentforumcomment': 'forums.comment',

	'highlight': Highlight,
	'note': Note,
	'redaction': Redaction,

	'contentrange.contentpointer': ContentPointer,
	'contentrange.contentrangedescription': ContentRangeDescription,
	'contentrange.domcontentpointer': DomContentPointer,
	'contentrange.domcontentrangedescription': DomContentRangeDescription,
	'contentrange.elementdomcontentpointer': ElementDomContentPointer,
	'contentrange.textcontext': TextContext,
	'contentrange.textdomcontentpointer': TextDomContentPointer,
	'contentrange.timecontentpointer': TimeContentPointer,
	'contentrange.timerangedescription': TimeRangeDescription,
	'contentrange.transcriptcontentpointer': TranscriptContentPointer,
	'contentrange.transcriptrangedescription': TranscriptRangeDescription,

	'openbadges.badge': null,//Need To Model

	// profile
	'profile.professionalposition': ProfessionalPosition,
	'profile.educationalexperiance': EducationalExperience,
	'profile.educationalexperience': EducationalExperience,

	'store.priceditem': PricedItem,
	'store.pricingresults': PricingResults,
	'store.purchasable': Purchasable,
	'store.purchasablecourse': PurchasableCourse,
	'store.purchasablecoursechoicebundle': PurchasableCourseChoiceBundle,
	'store.purchaseattempt': PurchaseAttempt,
	'store.giftpurchaseattempt': GiftPurchaseAttempt,
	'store.stripeconnectkey': StripeConnectKey,
	'store.stripepricedpurchasable': StripePricedPurchasable,
	'store.stripepurchaseitem': StripePurchaseItem,
	'store.stripepurchaseorder': StripePurchaseOrder,

	'messageinfo': MessageInfo,
	'_meeting': RoomInfo,
	'transcript': Transcript,
	'transcriptsummary': TranscriptSummary
};


function getType (o) {
	return o.MimeType || o.mimeType || o.Class;
}


function error (obj) {
	let e = new Error('No Parser for object: ' + (obj && getType(obj)) + '\n' + JSON.stringify(obj).substr(0, 50));
	e.NoParser = true;
	throw e;
}


export function getModelByType (type) {
	type = type.replace(/^application\/vnd.nextthought./, '');
	let p = PARSERS[type];
	if (typeof p === 'string') {
		p = p !== type ? getModelByType(p) : undefined;
	}


	if (p && !p.parse) {
		p.parse = (p.prototype.constructor.length > 2) ?
			ConstructorFuncWithParent :
			ConstructorFunc;
	}

	return p;
}


export function parse (service, parent, obj) {
	if (obj == null) {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map(o => {
			try {
				o = parse(service, parent, o);
			}
			catch (e) {
				if (!e.NoParser) {
					throw e;
				}
				console.warn(e.message);
			}
			return o;
		});
	}

	if (Object.getPrototypeOf(obj) !== Object.getPrototypeOf({})) {
		let message = 'Attempting to parse somthing other than an object-literal';
		console.error('%s %o', message, obj);
		throw new Error(message);
	}

	let Cls = getModelByType(getType(obj));
	let args = [service];

	if (Cls && Cls.parse.length > 2) {
		args.push(parent);
	}

	args.push(obj);

	return (Cls && Cls.parse(...args)) || error(obj);
}


export function parseListFn (scope, service) {
	let m = o => {
		try {
			o = parse(service, null, o);
			scope.addToPending(o);
			if(o && o.on && scope.onChange) {
				o.on('change', scope.onChange.bind(scope));
			}
		} catch(e) {
			console.error(e.stack || e.message || e);
			o = null;
		}

		return o;
	};

	return list=>list.map(m).filter(identity);
}


//Default Constructors
function ConstructorFuncWithParent (service, parent, data) {
	return (this.prototype.isPrototypeOf(data)) ? data :
	new this(service, parent, data);
}


function ConstructorFunc (service, data) {
	return (this.prototype.isPrototypeOf(data)) ? data :
	new this(service, data);
}
