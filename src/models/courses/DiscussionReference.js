import { decorate } from '@nti/lib-commons';
import { parseNTIID, isNTIID } from '@nti/lib-ntiids';

import { model, COMMON_PREFIX } from '../Registry';
import Base from '../Base';
import { Service } from '../../constants';

const RESOLVE_TARGET = Symbol('Target');
const RESOLVED_TARGET_NTIID = Symbol('Resolved Target NTIID');

/*
{
"Target-NTIID": "tag:nextthought.com,2011-10:LSTD_1153-Topic:EnrolledCourseRoot-Open_Discussions.1_1_Warmer__Elias_Hill",
"icon": "resources/NTI1000_TestCourse/1f776a9a43573661f01c10f54e754458ebeaab6b/fd35e23767020999111e1f49239199b4c5eff23e.jpg",
"label": "",
"title": "1.1 Warmer: Elias Hill"
}
*/
class DiscussionReference extends Base {
	static MimeType = [
		COMMON_PREFIX + 'discussion',
		COMMON_PREFIX + 'discussionref',
	];

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'icon':         { type: 'string' },
		'label':        { type: 'string' },
		'title':        { type: 'string' },
		'Target-NTIID': { type: 'string' },
	}

	constructor(service, parent, data) {
		super(service, parent, data);

		this.addToPending(this.resolveTarget());
	}

	get target() {
		return this[RESOLVED_TARGET_NTIID] || this['Target-NTIID'];
	}

	pointsToId(id) {
		return this.target === id;
	}

	async resolveTarget(course) {
		if (this[RESOLVE_TARGET]) {
			return this[RESOLVE_TARGET];
		}

		try {
			this[RESOLVE_TARGET] = resolveTarget(this, course);

			const target = await this[RESOLVE_TARGET];

			if (!hasValidTargetNTIID(this)) {
				this[RESOLVED_TARGET_NTIID] = target.getID();
			}
		} catch (e) {
			//swallow
		}
	}
}

export default decorate(DiscussionReference, { with: [model] });

function hasValidTargetNTIID(ref) {
	return ref['Target-NTIID'] && isNTIID(ref['Target-NTIID']);
}

async function resolveTarget(ref, course) {
	try {
		return await resolveTargetNTIID(ref, course);
	} catch (e) {
		return resolveNTIID(ref, course);
	}
}

async function resolveTargetNTIID(ref, course) {
	if (!hasValidTargetNTIID(ref)) {
		throw new Error('Invalid Target NTIID');
	}

	const service = ref[Service];
	const target = await service.getObject(
		maybeFixNTIID(ref['Target-NTIID'], course)
	);

	return target;
}

async function resolveNTIID(ref, courseOverride) {
	const service = ref[Service];
	const course = courseOverride || ref.parent('isCourse');
	const ntiids = ref.NTIID ? ref.NTIID.split(' ') : [];

	async function resolve(index) {
		const id = ntiids[index];

		if (!id) {
			throw new Error('Unable to resolve topic');
		}

		try {
			const topic = await service.getObject(maybeFixNTIID(id, course));

			return topic;
		} catch (e) {
			return resolve(index + 1);
		}
	}

	return resolve(0);
}

/*
 * Here is a hack.  The crux of which is to supply context about the subinstance we are in
 * when we resolving a topic. We do this primarily for instructors who may instruct multiple
 * subinstances that contain this discussion although strickly speaking it coudl happen for any
 * account type if the account is enrolled in multiple subinstances of a course that contain
 * the same named topic.	 The issue is without the contexxt of the course we are in when the topic
 * is selected on the overview the server as multiple topics to choose from (one for each section)
 * and it is ambiguous as to which one to select.  Now the problem with this particular hack
 * is that when we are in a section but trying to get to the root (because the topics are set up
 * in the root rather than the section) the provider id no longer matches the root and we 404.  In most
 * cases the section is what contains the topic making this a non issue, but we now have courses where
 * the topic only exists in the parent.	We need another way to pass the context of the such that we
 * get the proper context in the event it is ambiguous.	While we have this in the context of a course (from
 * the overview or content) we aren't going to have this in the stream right?  I think this manifests
 * as course roulette but that is already a problem right?
 */
const SPECIAL_ID_REGEX = /^Topic:EnrolledCourse(Section|Root)$/;
function maybeFixNTIID(ntiid, course) {
	const parts = parseNTIID(ntiid);
	const catalogEntry = course && course.CatalogEntry;

	if (catalogEntry && parts && SPECIAL_ID_REGEX.test(parts.specific.type)) {
		parts.specific.$$provider = (
			catalogEntry.ProviderUniqueID || ''
		).replace(/[\W-]/g, '_');
	}

	return parts.toString();
}
