$(document).bind("mobileinit", function () {
	$.mobile.ns = "jquerymobile";
	$.mobile.autoInitializePage = false;
	$.mobile.ajaxEnabled = false;
	$.mobile.linkBindingEnabled = false;
	$.mobile.hashListeningEnabled = false;
	$.mobile.pushStateEnabled = false;
	$.mobile.defaultPageTransition = 'none';
	$.mobile.defaultDialogTransition = 'none';
	$.mobile.loadingMessage = false;
	$.mobile.pageLoadErrorMessage = false;
});
