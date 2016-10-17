$(function () {
	$('.tab-pane input[name^="friendname"]').change(function () {
		$('#messagetab' + $(this).parents('.tab-pane').first().attr('id').substring(7)).text($(this).val());
	});
	$('#addmessage').click(function () {
		var message = $('form .tab-pane').size();
		$('#addmessage').parent().before("<li><a href'#message" + message + "' id='messagetab" + message + "' data-toggle='tab'>New</a></li>");
		$('form .tab-content').last().append($("#newmessage").clone().attr('id', 'message' + message));
		$('#messagetab' + message).click(function () {
			$(this).parents('.tabbable').find('.tab-content .active').removeClass('active');
			$('#message' + message).addClass('active');
		}).click();
		$('#message' + message + ' input[name^="friendname"]').change(function () {
			$('#messagetab' + message).text($(this).val());
		});
	});
});
