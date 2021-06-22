/** @typedef {new (...args: any[]) => {}} Constructor */

export const Parent = Symbol.for('Parent');
export const Service = Symbol.for('Service');

export const Context = Symbol.for('Context');

export const Parser = Symbol('Parser');

export const ServiceStash = Symbol.for('nti:service');

export const Progress = Symbol.for('Progress');
export const Summary = Symbol('Container-Summary');

export const RepresentsSameObject = Symbol('Represents-Same-Object');

export const DELETED = Symbol.for('DELETED');
export const SAVE = Symbol.for('SAVE');

export const IsModel = Symbol('isModel');

export const EVENT_BEGIN = 'begin';
export const EVENT_FINISH = 'finish';

export const REQUEST_CONFLICT_EVENT = 'request-needs-confirmation';
export const REQUEST_ERROR_EVENT = 'global-request-error-notification';

export const MODEL_INSTANCE_CACHE_KEY = '%%model.instances%%';

export const REL_MESSAGE_INBOX = 'RUGDByOthersThatIMightBeInterestedIn';
export const REL_RECURSIVE_STREAM = 'RecursiveStream';
export const REL_RECURSIVE_USER_GENERATED_DATA = 'RecursiveUserGeneratedData';
export const REL_RELEVANT_CONTAINED_USER_GENERATED_DATA =
	'RelevantContainedUserGeneratedData';
export const REL_RELEVANT_USER_GENERATED_DATA = 'RelevantUserGeneratedData';
export const REL_USER_GENERATED_DATA = 'UserGeneratedData';
export const REL_USER_SEARCH = 'UserSearch';
export const REL_BULK_USER_RESOLVE = 'ResolveUsers';
export const REL_USER_RESOLVE = 'ResolveUser';
export const REL_USER_GENERATED_DATA_SEARCH = 'UGDSearch';
export const REL_USER_UNIFIED_SEARCH = 'UnifiedSearch';
export const ROOT_NTIID = 'tag:nextthought.com,2011-10:Root';

export const ASSESSMENT_HISTORY_LINK = 'History';
export const SURVEY_REPORT_LINK = 'report-InquiryReport.pdf';
export const SURVEY_AGGREGATED_LINK = 'Aggregated';

export const SCOPED_COURSE_INSTANCE = Symbol('scoped course instance');

export const MEDIA_BY_OUTLINE_NODE = 'MediaByOutlineNode';

export const NO_LINK = 'No Link';
export const TOS_NOT_ACCEPTED = 'content.initial_tos_page';

export const SortOrder = {
	ASC: 'ascending',
	DESC: 'descending',

	reverse(dir) {
		return dir === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC;
	},
};
