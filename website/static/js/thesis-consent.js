$(function () {
	"use strict";

	// Web Requests
	$.ajax({
		url: "../consent/", 
		success: function (data) {
			var id;
			for (id in data) {
				$('#' + id).popover({'placement': 'top', 'title': data[id]['title'], 'content': data[id]['content']});
			}
		},
		dataType: 'JSON'
	});

});
