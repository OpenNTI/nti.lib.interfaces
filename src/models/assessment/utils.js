import urlJoin from 'nti-commons/lib/url-join';

export function resolveSubmitTo (item, rel = 'Assessments') {
	const FindCourse = (o) => o && o.isCourse && o.hasLink(rel);
	const course = item.parent(FindCourse);

	return course && urlJoin(course.getLink(rel), encodeURIComponent(item.getID()));
}
