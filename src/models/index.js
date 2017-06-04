import Registry from './Registry';
//
import './Base';
import './Change';
//
import './User';
import './Community';
import './FriendsList';
import './DynamicFriendsList';
import './PageInfo';
import './SharingPagePreference';
import './Badge';
import './BadgeIssuer';
import './SuggestedContacts';
//Slides
import './Slide';
import './SlideVideo';
import './SlideDeck';
import './DiscussionReference';
import './RelatedWorkReference';
import './RelatedWorkReferencePointer';
import './Timeline';
//chat
import './chat/MessageInfo';
import './chat/RoomInfo';
import './chat/Transcript';
import './chat/TranscriptSummary';
// profile
import './profile/ProfessionalPosition';
import './profile/EducationalExperience';
import './annotations/Highlight';
import './annotations/Note';
import './annotations/Redaction';
import './anchors/ContentPointer';
import './anchors/ContentRangeDescription';
import './anchors/DomContentPointer';
import './anchors/DomContentRangeDescription';
import './anchors/ElementDomContentPointer';
import './anchors/TextContext';
import './anchors/TextDomContentPointer';
import './anchors/TimeContentPointer';
import './anchors/TimeRangeDescription';
import './anchors/TranscriptContentPointer';
import './anchors/TranscriptRangeDescription';
//
import './content/Package';
import './content/RenderablePackage';
import './content/ContentPackageRenderJob';
import './content/Bundle';
import './content/File';
import './content/Folder';
import './content/Root';
//
import './MediaSource';
import './Video';
import './VideoRef';
//
import './courses/Grade';
import './courses/CourseDiscussion';
import './courses/GradeBookShell';
import './courses/GradeBookByAssignment';
import './courses/GradeBookUserSummary';
import './courses/CatalogEntry';
import './courses/Instance';
import './courses/AdministrativeRole';
import './courses/Enrollment';
import './courses/EnrollmentOptions';
import './courses/EnrollmentOption';
import './courses/EnrollmentOptionOZone';
import './courses/EnrollmentOption5Minute';
import './courses/EnrollmentOptionPurchase';
import './courses/SharingScopes';
import './courses/Outline';
import './courses/OutlineNode';
import './courses/OutlineNodeProgress';
//
import './courses/activity/RecursiveStreamBucket';
import './courses/activity/RecursiveStreamByBucket';
//
import './Progress';
//
import './courses/overview/LeasonOverview';
import './courses/overview/Group';
import './courses/overview/VideoRoll';
//
import AssessmentQuestionSet from './assessment/QuestionSet';
import AssessmentQuestionSetRef from './assessment/QuestionSetReference';
import AssessmentQuestion from './assessment/Question';
import AssessmentSurvey from './assessment/survey/Survey';
import AssessmentSurveyReference from './assessment/survey/SurveyReference';
import AssessmentPoll from './assessment/survey/Poll';
import AssessmentPollReference from './assessment/survey/PollReference';
import AssessmentAggregatedSurvey from './assessment/survey/aggregated/Survey';
import AssessmentAggregatedPoll from './assessment/survey/aggregated/Poll';
import AssessmentAggregatedFreeResponsePart from './assessment/survey/aggregated/parts/FreeResponse';
import AssessmentAggregatedMultipleChoiceMultipleAnswerPart from './assessment/survey/aggregated/parts/MultipleChoiceMultipleAnswer';
import AssessmentAggregatedMultipleChoicePart from './assessment/survey/aggregated/parts/MultipleChoice';
import AssessmentAggregatedModeledContentPart from './assessment/survey/aggregated/parts/ModeledContent';
import AssessmentAggregatedMatchingPart from './assessment/survey/aggregated/parts/Matching';
import AssessmentAggregatedOrderingPart from './assessment/survey/aggregated/parts/Ordering';
import AssessmentAssignmentRef from './assessment/assignment/AssignmentReference';
import AssessmentAssignment from './assessment/assignment/Assignment';
import AssessmentAssignmentMetadataItem from './assessment/assignment/AssignmentMetadataItem';
import AssessmentTimedAssignment from './assessment/assignment/TimedAssignment';
import AssessmentDiscussionAssignment from './assessment/assignment/DiscussionAssignment';
import AssessmentAssignmentPart from './assessment/assignment/AssignmentPart';
import AssessmentAssessedQuestionSet from './assessment/AssessedQuestionSet';
import AssessmentAssessedQuestion from './assessment/AssessedQuestion';
import AssessmentAssessedPart from './assessment/AssessedPart';
import AssessmentAssignmentSubmission from './assessment/assignment/AssignmentSubmission';
import AssessmentQuestionSetSubmission from './assessment/QuestionSetSubmission';
import AssessmentQuestionSubmission from './assessment/QuestionSubmission';
import AssessmentPollSubmittion from './assessment/survey/PollSubmission';
import AssessmentSurveySubmittion from './assessment/survey/SurveySubmission';
import AssessmentResponse from './assessment/Response';
import AssessmentPart from './assessment/Part';
import AssessmentSolution from './assessment/Solution';
import AssessmentHint from './assessment/Hint';
import AssessmentPartFile from './assessment/parts/File';
import AssessmentPartFillInTheBlank from './assessment/parts/FillInTheBlank';
import AssessmentPartMatching from './assessment/parts/Matching';
import AssessmentPartMultipleChoice from './assessment/parts/MultipleChoice';
import AssessmentPartOrdering from './assessment/parts/Ordering';
import AssessmentInquiryItem from './assessment/survey/InquiryItem';
import AssessmentInquiryItemResponse from './assessment/survey/InquiryItemResponse';
import AssessmentSavePointItem from './assessment/assignment/SavePointItem';
import './assessment/WordBank';
import './assessment/WordEntry';
import AssessmentAssignmentHistoryItem from './assessment/assignment/AssignmentHistoryItem';
import AssessmentAssignmentHistoryItemSummary from './assessment/assignment/AssignmentHistoryItemSummary';
import AssessmentAssignmentHistoryCollection from './assessment/assignment/AssignmentHistoryCollection';
import AssessmentAssignmentFeedback from './assessment/assignment/AssignmentFeedback';
import AssessmentAssignmentFeedbackContainer from './assessment/assignment/AssignmentFeedbackContainer';
//
import './forums/Board';
import './forums/Topic';
import './forums/Forum';
import './forums/Post';
import './forums/Comment';
import './forums/BlogEntry';
import './forums/Blog';
import './forums/UserTopicParticipationSummary';
import './forums/UserTopicParticipationContext';
//
import './store/PricedItem';
import './store/PricingResults';
import './store/Purchasable';
import './store/PurchasableCourse';
import './store/PurchasableCourseChoiceBundle';
import './store/PurchaseAttempt';
import './store/GiftPurchaseAttempt';
import './store/StripeConnectKey';
import './store/StripePricedPurchasable';
import './store/StripePurchaseItem';
import './store/StripePurchaseOrder';

Registry.alias('link', 'ignored');
Registry.alias('assessment.questionbank', 'ignored');
Registry.alias('assessment.questionmap', 'ignored');

export const s = {

	'assessment.assessedquestionset': AssessmentAssessedQuestionSet,
	'assessment.assessedquestion': AssessmentAssessedQuestion,
	'assessment.assessedpart': AssessmentAssessedPart,

	'questionsetref': AssessmentQuestionSetRef,
	'questionset': AssessmentQuestionSet,
	'naquestionset': 'questionset',
	'narandomizedquestionset': 'questionset',
	'naquestionbank': 'questionset',
	'assessment.randomizedquestionset': 'questionset',

	'question': AssessmentQuestion,
	'naquestion': 'question',
	'naquestionfillintheblankwordbank': 'question',
	'assessment.fillintheblankwithwordbankquestion': 'question',

	'nasurvey': AssessmentSurvey,
	'napoll': AssessmentPoll,
	'surveyref': AssessmentSurveyReference,
	'pollref': AssessmentPollReference,
	'assessment.pollsubmission': AssessmentPollSubmittion,
	'assessment.surveysubmission': AssessmentSurveySubmittion,
	'assessment.aggregatedsurvey': AssessmentAggregatedSurvey,
	'assessment.aggregatedpoll': AssessmentAggregatedPoll,

	'assignmentref': AssessmentAssignmentRef,
	'assessment.assignment': AssessmentAssignment,
	'assessment.timedassignment': AssessmentTimedAssignment,
	'assessment.discussionassignment': AssessmentDiscussionAssignment,
	'assessment.userscourseassignmentmetadataitem': AssessmentAssignmentMetadataItem,

	'assessment.assignmentpart': AssessmentAssignmentPart,


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

	'assessment.aggregatedfreeresponsepart': AssessmentAggregatedFreeResponsePart,
	'assessment.aggregatedmultiplechoicemultipleanswerpart': AssessmentAggregatedMultipleChoiceMultipleAnswerPart,
	'assessment.aggregatedmultiplechoicepart': AssessmentAggregatedMultipleChoicePart,
	'assessment.aggregatedmatchingpart': AssessmentAggregatedMatchingPart,
	'assessment.aggregatedorderingpart': AssessmentAggregatedOrderingPart,
	'assessment.aggregatedmodeledcontentpart': AssessmentAggregatedModeledContentPart,

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

	'assessment.assignmenthistoryitem': AssessmentAssignmentHistoryItem,
	'assessment.assignmenthistoryitemsummary': AssessmentAssignmentHistoryItemSummary,
	'assessment.userscourseassignmenthistoryitemsummary': 'assessment.assignmenthistoryitemsummary',
	'assessment.userscourseassignmenthistory': AssessmentAssignmentHistoryCollection,
	'assessment.userscourseassignmenthistoryitem': 'assessment.assignmenthistoryitem',
	'assessment.userscourseassignmenthistoryitemfeedback': AssessmentAssignmentFeedback,
	'assessment.userscourseassignmenthistoryitemfeedbackcontainer': AssessmentAssignmentFeedbackContainer,
};


export Registry from './Registry';
