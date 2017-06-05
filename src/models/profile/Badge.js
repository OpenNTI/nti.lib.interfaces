import {Parser as parse} from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

@model
export default class Badge extends Base {
	static MimeType = [
		COMMON_PREFIX + 'badge',
		COMMON_PREFIX + 'openbadges.badge'
	]

	constructor (service, parent, data) {
		super(service, parent, data);

		/*
		"Type": "Course",
		"alignment": null,
		"criteria": "https://ou-alpha.nextthought.com/course.cs1300.html",
		"description": "Completed all of the quizes with a 70% or more.",
		"href": "/dataserver2/OpenBadges/Power%20and%20Elegance%20of%20Computational%20Thinking",
		"image": "https://ou-alpha.nextthought.com/hosted_badge_images/tag_nextthought.com_2011-10_OU-HTML-CS1300_Power_and_Elegance_of_Computational_Thinking.course_badge.png",
		"name": "Power and Elegance of Computational Thinking",

		"tags": [
			"computer",
			"power"
		]
		*/

		this[parse]('issuer');
	}
}
