import Base from '../Base';
import {
	Parser as parse,
	Service
} from '../../CommonSymbols';

import unique from '../../utils/array-unique';

import forwardFunctions from '../../utils/function-forwarding';

const PerformToCNodeFilter = Symbol.for('ToC:PerformNodeFilter');

export default class Enrollment extends Base {
	constructor (service, data) {
		super(service, null, data,
			{
				isCourse: true,
				isEnrollment: true
			},

			forwardFunctions([
				'getOutline',
				'getPresentationProperties',
				'getPublicScope',
				'getDiscussions',
				'hasDiscussions'
			//From:
			], 'CourseInstance'),

			forwardFunctions([
				'getEndDate',
				'getStartDate'

			//From:
			], 'CourseInstance.CatalogEntry'));


		let i = this[parse]('CourseInstance');

		i.on('changed', this.onChange.bind(this));
	}


	drop () {
		return this[Service].delete(this.href);
	}


	getCourseID () {
		return this.CourseInstance.getID();
	}


	getStatus () {
		return this.LegacyEnrollmentStatus;
	}


	[PerformToCNodeFilter] (toc, remove) {
		let status = this.LegacyEnrollmentStatus;


		for(let e of toc.findall('*[@visibility]')) {
			if (/everyone/i.test(e.get('visibility'))) {
				continue;
			}

			if (!this.hasVisibility(e, status)) {
				getToCNodesReferencing(e.get('target-ntiid'), toc)
					.forEach(remove);
			}
		}
	}
}


function getToCNodesReferencing (ntiid, toc) {
	if (!toc || !ntiid) {
		return [];
	}

	function getNodesForKey(keys) {
		let nodes = [];

		for(let k of keys) {
			nodes = unique(nodes.concat(toc.findall('*[@' + k + '="' + ntiid + '"]')));
		}

		return nodes;
	}

	return getNodesForKey(['ntiid', 'target-ntiid']);
}
