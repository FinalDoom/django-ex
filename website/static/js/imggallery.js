$(function () {
	'use strict';

	// Start slideshow button:
	$('#start-slideshow').button().click(function () {
		var options = $(this).data(),
		modal = $(options.target),
		data = modal.data('modal');
		if (data) {
			$.extend(data.options, options);
		} else {
			options = $.extend(modal.data(), options);
		}
		modal.find('.modal-slideshow').children()
			.removeClass('icon-play')
			.addClass('icon-pause');
		modal.modal(options);
	});

	// Toggle fullscreen button:
	$('#toggle-fullscreen').button().click(function () {
		var button = $(this),
		root = document.documentElement;
		if (!button.hasClass('active')) {
			$('#modal-gallery').addClass('modal-fullscreen');
			if (root.webkitRequestFullScreen) {
				root.webkitRequestFullScreen(
					window.Element.ALLOW_KEYBOARD_INPUT
					);
			} else if (root.mozRequestFullScreen) {
				root.mozRequestFullScreen();
			}
		} else {
			$('#modal-gallery').removeClass('modal-fullscreen');
			(document.webkitCancelFullScreen ||
				document.mozCancelFullScreen ||
				$.noop).apply(document);
		}
	});

	$.ajax({
		url: 'img/?images=true', // TODO how to relativize links here
		dataType: 'json',
		success: function (data) {
			var gallery = $('#gallery');
			$.each(data.images, function (index, image) {
				$('<a />')
					.attr('rel', 'gallery')
					.prop('href', image.url)
					.prop('title', image.name)
					.append(
						$('<img>').prop('src', image.thumbnail))
					.appendTo(gallery);
			});
		}
	});
});
