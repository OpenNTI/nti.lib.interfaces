import { URL } from '@nti/lib-commons';

export function resolveSubmitTo(item, rel = 'Assessments') {
	const FindCourse = o => o && o.isCourse && o.hasLink(rel);
	const course = item.parent(FindCourse);

	return (
		course &&
		URL.join(course.getLink(rel), encodeURIComponent(item.getID()))
	);
}
