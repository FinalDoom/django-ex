$(function () {
	$("#contactme").validate({
		onkeyup: false,
		errorClass: "error",
		errorElement: "span",
		rules: {
			name: {
				required: true
			},
			email: {
				email: true,
				maxlength: 254,
				required: true
			},
			phone: {
				digits: true,
				maxlength: 15
			},
			scaptcha: {
				required: true
			}
		},
		messages: {
			name: {
				required: "Please provide your name."
			},
			email: {
				email: "Your email address must be in a valid format.",
				maxlength: jQuery.format("Email addresses are {0} characters max."),
				required: "We need your email address to contact you."
			},
			phone: {
				digits: "Please enter only numbers for your phone.",
				maxlength: jQuery.format("Phone numbers can't be more than {0} characters.")
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
