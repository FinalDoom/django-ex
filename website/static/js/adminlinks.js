(function () {
	"use strict";
	$(function () {
		var canvases = $('canvas'), first, last;
		canvases.each(function () {
			var fromCells = $('table tbody tr:first-child td:nth-child(' + ($(this).parent().index()) + ')')
					.add($('table tbody tr:not(:first-child) td:nth-child(' + (($(this).parent().index() + 1) / 2) + ')')),
				toCells = $('table tbody tr:first-child td:nth-child(' + ($(this).parent().index() + 2) + ')')
					.add($('table tbody tr:not(:first-child) td:nth-child(' + (($(this).parent().index() + 3) / 2) + ')')),
				canvas = this, ctx, pos = 0, first, last, index;
			if (!canvas.getContext) {
				$(canvas).hide();
				return;
			}
			canvas.height = $(canvas).parent().height();
			ctx = canvas.getContext('2d');
			ctx.lineWidth = 2;
			ctx.strokeStyle = "#08C";
			fromCells.each(function (index) {
				pos = $(this).offset().top - $(this).parent().parent().offset().top +
					$(this).height() / 2;
				if ($.trim($(this).text()) !== "" &&
					$.trim($(toCells[index]).text()) !== "") {
					if (first > -1 && last > -1 && first !== last) {
						ctx.beginPath();
						ctx.moveTo(12, first);
						ctx.lineTo(12, last);
						ctx.stroke();
					}
					ctx.beginPath();
					ctx.moveTo(0, pos);
					ctx.lineTo($(canvas).width(), pos);
					ctx.stroke();
					first = pos;
					last = pos;
				} else if ($.trim($(toCells[index]).text()) !== "") {
					ctx.beginPath();
					ctx.moveTo(12, pos);
					ctx.lineTo($(canvas).width(), pos);
					ctx.stroke();
					last = pos;
				}
			});
			if (first > -1 && last > -1 && first !== last) {
				ctx.beginPath();
				ctx.moveTo(12, first);
				ctx.lineTo(12, last);
				ctx.stroke();
			}
		});
	});
}());
