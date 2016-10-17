(function () {
	"use strict";
	$(function () {
		if ($('#content table').length > 0) {
			var lastRead = $.cookie('lastread'),
				unread = $.cookie('unread');
			if (lastRead == null) {
				lastRead = Date.parse(new Date());
			}
			$.cookie('lastread', Date.parse(new Date()));
			if (unread == null) {
				unread = [];
				$('.title a').each(function () {
					var id;
					id = $(this).attr('href').split('/');
					id = id[id.length-2];
					unread.push(id);
				});
				$.cookie('unread', unread.join(','));
			} else {
				unread = unread.split(',');
			}
			if (unread.length > 0 && unread[0] !== 'none') {
				$('#content').append(
					$('<a />')
						.attr('id', 'markread')
						.one('click', function (event) {
							$.cookie('unread', 'none', { expires: (365 * 10) });
							$('.new').text('');
							$(this).remove();
						})
						.text('Mark All Read'));
			}

			$.get(window.location.href + 'handler/',
				function (data) {
					data = $.parseJSON(data);
					// Fill in all the rows
					$('#content table').first().append($(tmpl('template-text', data)));
					// Check each to see if it's newer than last modified
					$('.date').each(function () {
						var datestring = $(this).text().split(','),
							date, id;
						if (['th', 'st', 'nd', 'rd'].indexOf(datestring[0].substring(datestring[0].length - 2)) > -1) {
							datestring[0] = datestring[0].substring(0, datestring[0].length - 2);
						}
						datestring = datestring.join(',');
						date = Date.parse(datestring);
						if (date > lastRead) {
							id = $(this).parent().children('.title').children('a').attr('href').split('/');
							id = id[id.length-2];
							unread.push(id);
						} else {
							return false;
						}
					});
					$.cookie('unread', unread.join(','), { expires: (365 * 10) });
					$('.title').each(function () {
						var id = $(this).children().first().attr('href');
						id = id.substring(0, id.length - 1);
						if (unread.indexOf(id) > -1) {
							$(this).parent().children('.new').append(
								$('<span />').addClass('label label-success')
									.text('NEW'));
						}
					});
					$('.title a').one('click', function (event) {
						var id, index,
							unread = $.cookie('unread').split(',');
						id = $(this).attr('href').split('/');
						id = id[id.length-2];
						index = unread.indexOf(id);
						if (index !== -1) {
							unread.splice(index, 1);
							if (unread.length === 0) {
								unread = 'none';
							}
							$.cookie('unread', unread.join(','), { expires: (365 * 10) });
							$(this).parent().parent().children('.new').text('');
						}
					});
				});
		} else {
			var textdir = window.location.href.split('/'),
				id;
			textdir.pop();
			id = textdir.pop();
			textdir = textdir.join('/');
			$.get(textdir + "/handler/",
				{ fileid: id },
				function (data) {
					data = $.parseJSON(data);
					if (data.error) {
						$('#content').append($('<dir class="alert alert-error" />').append(
							$('<a class="close" data-dismiss="alert">x</a>')).append(
							$('<h4 class="alert-heading">').text(data.error)).append(
							document.createTextNode(data.message)));
					} else {
						$('#content').append($(data.content)).append($('<br /><br />')).append(
							$('<a id="textdownload">Download</a>').attr('href', data.download));
					}
				});
		}
	});
}());
