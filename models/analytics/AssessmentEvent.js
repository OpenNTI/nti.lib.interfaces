import BasicEvent from './Base';
import {SELFASSESSMENT_VIEWED} from './MimeTypes';

export default class AssessmentEvent extends BasicEvent {
	constructor (contentId, courseId, assessmentId, mime) {
		super(mime || SELFASSESSMENT_VIEWED, courseId);
		if (!assessmentId) {
			console.error('No Assessment ID for Assessment Viewed Analytics Event');
		}
		Object.assign(this, {
			ResourceId: assessmentId,
			ContentId: contentId
		});
	}
}
