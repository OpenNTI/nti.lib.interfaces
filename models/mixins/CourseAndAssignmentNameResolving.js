/**
 * This is for Objects within an assignment history item.
 */

import getLink from '../../utils/getlink';

import {Service} from '../../CommonSymbols';

export default {

	constructor () {
		let service = this[Service];

		let courseInstanceUrl = (this.getLink('AssignmentHistoryItem') || this.href || '')
									.replace(/\/AssignmentHistories.*/, '');

		let assignmentId = this.AssignmentId;
		let a, b, result;


		//If this model has an assignment parent model instance,
		a = this.parent('MimeType', /assessment.assignment$/i);
		a = (a ?
		//... the assignment title is already known... use it.
			Promise.resolve(a) :
		//Otherwise, load the assignment object
			service.getObject(assignmentId)
		)
		//then... Pluck the assignment object title...
			.then(assignment=>
				this.AssignmentName = assignment.title);



		//This is really dirty (IMO),
		//TODO: Find a better way to resolve the "Course Name"
		b = service.get(courseInstanceUrl).then(courseInstanceData =>
				//OMG, ICK! Yet another request...
				service.get(getLink(courseInstanceData, 'CourseCatalogEntry'))
			)

			//Okay, the scary part is over! just grab what we need and run.
			.then(catalogEntryData =>
				this.CourseName = catalogEntryData.Title);


		//Wait on the two async operations (a and b), then fire a change
		// event so views know values changed.
		result = Promise.all([a, b])
			.then(()=>this.emit('change'));

		this.addToPending(result);
	}

};
