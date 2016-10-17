$(function () {
	$("#postcardrequest").validate({
		onkeyup: false,
		errorClass: "error",
		errorElement: "span",
		rules: {
			name: {
				required: true
			},
			donation: {
				number: true
			},
			address: {
				required: true
			},
			scaptcha: {
				required: true
			}
		},
		messages: {
			name: {
				required: "Please provide your name."
			},
			donation: {
				number: "Your donation amount must be a number (decimals allowed) or nothing."
			},
			address: {
				required: "Please proved an address I can send postcards to."
			},
			scaptcha: {
				required: "Please answer the anti-spam question."
			}
		},
		showErrors: function(errorMap, errorList) {
			$("div.control-group.error").not("#scaptcha").removeClass("error");
			this.defaultShowErrors();
			$("span.error").addClass("help-inline");
			$("span.error:visible").parents("div.control-group").addClass("error");
		}
	});
});
