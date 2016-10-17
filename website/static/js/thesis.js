$(function () {
	"use strict";

	$("#language-0").attr("placeholder", "Most Used on Twitter").parents("div.control-group").children("label.control-label").text("Primary Language");
	$("#region-0").attr("placeholder", "Current Residence").parents("div.control-group").children("label.control-label").text("Country or State of Residence");

	////// Input checking

	//// Value Setup
	var genders = ['Male', 'Female'],
		months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
		years = [],
		signs = ['Aquarius', 'Aries', 'Cancer', 'Capricorn', 'Gemini', 'Leo', 'Libra', 'Pisces', 'Saggitarius', 'Scorpio', 'Taurus', 'Virgo'],
		curyear = (new Date()).getFullYear(),
		i,
		validator,
		infoObj,
		makeExtras,
		languages,
		regions;

	// Populate years
	for (i = curyear; i >= curyear - 120; --i) {
		years.push(i.toString());
	}

	// Static
//    $('#gender').typeahead({'source': genders});
//    $('#gender').prop('selectedIndex', -1);
	$('#year').typeahead({'source': years});
//    $('#month').typeahead({'source': months});
//    $('#astrology').typeahead({'source': signs});

	//// Validation Setup
	$.validator.addMethod("alpha", function(value, element) {
		value = value.replace(/\S*/g, function (txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
		element.value = value;
		return this.optional(element) || /^[a-zA-Z]+$/.test(value);
	}, "Please enter only letters.");
	$.validator.addMethod("username", function(value, element) {
		return this.optional(element) || /^[a-zA-Z0-9_]+$/.test(value);
	}, "Usernames can only be letters, underscores, or numbers.");
	$.validator.addMethod("gender", function(value, element) {
		return this.optional(element) || $.inArray(value, genders) > -1;
	}, "Please enter a valid gender.");
	$.validator.addMethod("month", function(value, element) {
//        value = value.replace(/\S*/g, function (txt) {
//            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
//        });
//        element.value = value;
		return this.optional(element) || $.inArray(value, months) > -1;
	}, "Please enter a valid month.");
	$.validator.addMethod("year", function(value, element) {
		return this.optional(element) || $.inArray(value, years) > -1;
	}, "Please enter a valid birth year.");
	$.validator.addMethod("astrology", function(value, element) {
		return this.optional(element) || $.inArray(value, signs) > -1;
	}, "Please enter a valid astrological sign.");
	jQuery.validator.addMethod("pattern", function(value, element, param) {
		value = value.replace(/\S*/g, function (txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
		element.value = value;
		return this.optional(element) || param.test(value);
	}, "Invalid format.");
	validator = $('form').validate({
		onkeyup: false,
		errorClass: "error",
		errorElement: "span",
		rules: {
			username: {
				username: true,
				maxlength: 15,
				remote: {
					beforeSend: function () {
						$('<span>').attr('for', 'username')
							.attr('generated', 'true')
							.attr('id', 'twitter-working')
							.addClass('help-inline')
							.text('Checking Username...')
							.insertAfter("#username");
					},
					complete: function () {
						$("#twitter-working").remove();
					},
					dataType: "json",
					url: "../twitter/"
				},
				required: true
			},
			year: {
				digits: true,
				maxlength: 4,
				max: years[0],
				minlength: 4,
				min: years[years.length-1],
				required: true,
				year: true
			},
			month: {
//                maxlength: 9,
//                minlength: 3,
				month: true
			},
			gender: {
				gender: true
			},
			industry: {
				pattern: /^[A-Za-z ]+$/
			},
			"language[0]": {
				pattern: /^[A-Za-z -]+$/
			},
			"region[0]": {
				pattern: /^[A-Za-z -]+$/
			},
			astrology: {
				astrology: true
			},
			"consent-basic": {
				required: true
			},
			email: {
				email: true,
				maxlength: 254
			},
		},
		errorPlacement: function (error, element) {
			if (element.attr("name") === "consent-basic") {
				error.insertAfter(element.parent().next());
			} else {
				error.insertAfter(element);
			}
		},
		messages: {
			username: {
				username: "Usernames can only be letters, underscores, or numbers.",
				maxlength: jQuery.format("Usernames can only be {0} characters."),
				remote: "The username must be registered with Twitter.",
				required: "Your Twitter username is required."
			},
			email: {
				email: "Your email address must be in a valid format.",
				maxlength: jQuery.format("Email addresses are {0} characters max."),
			},
			industry: {
				pattern: "Please enter only letters and spaces."
			},
			"language[0]": {
				pattern: "Please enter only letters, dashes, and spaces."
			},
			"region[0]": {
				pattern: "Please enter only letters, dashes, and spaces."
			},
		},
		showErrors: function(errorMap, errorList) {
			$("div.control-group.error").not("#scaptcha").removeClass("error");
			this.defaultShowErrors();
			$("span.error").addClass("help-inline");
			$("span.error:visible").parents("div.control-group").addClass("error");
		},
	});


	////// Extra Functionality
	$("#update-cancel").removeAttr("href").css("cursor", "pointer").click(function () {
		$(this).parents("div.control-group.required").remove();
	});

	infoObj = function(length, type, header, placeholder) {
		this.length = length;
		this.type = type;
		this.header = header;
		this.placeholder = placeholder;
	}

	makeExtras = function(info) {
		var extradiv;
		if ($("#" + info.type + "-extra").length == 1) {
			extradiv = $("#" + info.type + "-extra");
		} else {
			extradiv = $("<div>")
				.addClass("control-group")
				.append($("<label>")
					.addClass("control-label")
					.attr({
						"for": info.type + "-1",
					})
					.text(info.header))
				.attr("id", info.type + "-extra");
			$("#" + info.type + "-0").parents("div.control-group").after(extradiv);
		}
		extradiv.append($("<div>")
			.addClass("controls")
			.append($("<input>")
				.attr("type", "text")
				.css("visibility", "hidden"))
			.append($("<span>")
				.addClass("help-inline")
				.append($("<a>")
					.click(function () {
						var newinput = $("<input>")
								.addClass("span6")
								.attr({
									"id": info.type + "-" + info.length,
									"name": info.type + "[" + info.length + "]",
									"type": "text",
									"placeholder": info.placeholder,
								})
								.typeahead({'source': window[info.type + "s"]}),
							newdiv = $("<div>")
							.addClass("controls")
							.append(newinput)
							.append($("<span>")
								.addClass("help-inline")
								.append($("<a>")
									.attr("for", info.type + "-" + info.length)
									.click(function () {
										var forid = $(this).attr("for"),
											fornum = parseInt(forid.split("-")[1]),
											nextelem;
										$("#" + $(this).attr("for")).parent().slideUp(function () {$(this).remove()});
										$("#" + info.type + "-" + (fornum - 1)).focus();
										for ( ; fornum < info.length - 1; ++fornum ) {
											nextelem = $("#" + info.type + "-" + ( fornum + 1 ) );
											nextelem.next("span.help-inline").not(".error").children("a").attr("for", info.type + "-" + fornum);
											nextelem.next("span.help-inline.error").attr("for", info.type + "-" + fornum);
											nextelem.attr({
												"name": info.type + "[" + fornum + "]",
												"id": info.type + "-" + fornum,
											});
										}
										info.length--;
									})
									.css("cursor", "pointer")
									.text("Remove " + info.type)))
							.css("display", "none");
						$(this).parents("div.controls").before(newdiv);
						newdiv.slideDown();
						newinput.focus();
						validator.settings.rules[info.type + "[" + info.length + "]"] = validator.settings.rules[info.type + "[0]"];
						validator.settings.messages[info.type + "[" + info.length + "]"] = validator.settings.messages[info.type + "[0]"];
						info.length++;
					})
					.css("cursor", "pointer")
					.text("Add a " + info.type))))
		extradiv.find("[id^=" + info.type + "-]").each(function(index, element) {
			var id = $(element).attr("id");
			$(element).parent()
				.append($("<span>")
					.addClass("help-inline")
					.append($("<a>")
						.attr("for", id)
						.click(function () {
							var forid = $(this).attr("for"),
								fornum = parseInt(forid.split("-")[1]),
								nextelem;
							$("#" + $(this).attr("for")).parent().slideUp(function () {$(this).remove()});
							for ( ; fornum < info.length - 1; ++fornum ) {
								nextelem = $("#" + info.type + "-" + ( fornum + 1 ) );
								nextelem.next("span.help-inline").not(".error").children("a").attr("for", info.type + "-" + fornum);
								nextelem.next("span.help-inline.error").attr("for", info.type + "-" + fornum);
								nextelem.attr({
									"name": info.type + "[" + fornum + "]",
									"id": info.type + "-" + fornum,
								});
							}
							info.length--;
						})
						.css("cursor", "pointer")
						.text("Remove " + info.type)))
		});
	}

	languages = new infoObj($("input[id^=language-]").length, "language", "Other Languages", "Next Most Used on Twitter");
	makeExtras(languages);

	regions = new infoObj($("input[id^=region-]").length, "region", "Previous Residences", "Next Longest Previous Residence");
	makeExtras(regions);
});
