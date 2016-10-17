(function () {
	"use strict";
	$(function () {
		$.get('quote/', function (data) {
			data = $.parseJSON(data);
			$('#quote p').text(data.quote);
			$('#quote small').text(data.author);
		});
	});
}());
