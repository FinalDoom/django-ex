$(function () {
	"use strict";
	$('li.dir > label > input[type="checkbox"]').click(function() {
		$(this).parent().parent().children('ul')
			.find('input[type="checkbox"]')
			.attr('checked',
				$(this).attr('checked') ? $(this).attr('checked') : null);
	});
});
