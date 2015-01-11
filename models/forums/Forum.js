'use strict';

var Base = require('../mixins/Base');
var GetContents = require('../mixins/GetContents');
//var SharedWithList = require('../mixins/SharedWithList');

var define = require('../../utils/object-define-properties');

var parseObject = require('../../utils/parse-object');
var parseKey = require('../../utils/parse-object-at-key');
var withValue = require('../../utils/object-attribute-withvalue');
var getLink = require('../../utils/getlink');


function Forum(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	Object.assign(this, data);

	// Creator: "username"
	// ID: "Forum" -- Local id (within the container)
	// NewestDescendant
	// NewestDescendantCreatedTime
	// TopicCount: 2
	// description: ""
	// title: "Forum"

	parseKey(this, 'NewestDescendant');
}

Object.assign(Forum.prototype, Base, GetContents, /*SharedWithList,*/ {

	getTopTopics: function() {
		var link = getLink(this, 'TopTopics');
		if (!link) {
			return Promise.reject('Forum doesn\'t have a \'TopTopics\' link.');
		}
		return this._service.get(link).then(function(result) {
			return parseObject(this, result.Items);
		}.bind(this));
	}

});


function parse(service, parent, data) {
	return new Forum(service, parent, data);
}

Forum.parse = parse;

module.exports = Forum;
