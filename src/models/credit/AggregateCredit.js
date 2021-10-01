import { Service } from '../../constants.js';

import BaseCredit from './BaseCredit.js';

export class AggregateCredit extends BaseCredit {
	/**
	 * @param {BaseCredit[]} types
	 * @returns {AggregateCredit[]}
	 */
	static from(types) {
		const aggMap = {};
		const defMap = {};

		for (const item of types) {
			if (!item.creditDefinition) {
				continue;
			}

			const key = item.creditDefinition.toString();
			aggMap[key] = (aggMap[key] ?? 0) + item.amount;
			defMap[key] = item.creditDefinition;
		}

		return Object.keys(aggMap)
			.map(
				k =>
					new AggregateCredit(defMap[k][Service], null, {
						credit_definition: defMap[k],
						amount: aggMap[k],
					})
			)
			.sort((a, b) =>
				a.creditDefinition.type.localeCompare(b.creditDefinition.type)
			);
	}
}
