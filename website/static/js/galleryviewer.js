(function () {
	'use strict';
	var // State variables
		bossmode, controltimeout, errorHeight,
		hidefunction, imageHeight = 0, imageWidth = 0,
		infotimeout, isLoading = 0, maximized, mobiletimeout,
		navshown, slideshowId, slideshowforward, slideshowdelay,
		tmpHeight, tmpWidth,
		// Document variables
		win = $(window), doc = $(document),
		wrapper, wrappercontainer, menu, header, subheader,
		content, containerbox, imagebox, linkbox, link,
		tmpImage, image, loadingImage, controls, push,
		footer,
		// Button variables
		controlcollection, playcollection,
		fullscreen, prev, next,
		info, favorite,
		full, fullicon, topb, maximize,
		play, playicon, reverse, reverseicon, faster, slower,
		// The image loader
		imageLoader;

	function descriptionUpdate(currentId, description) {
		if (currentId !== null) {
			window.location.hash = "#" + currentId;
			$.cookie('lastseen', currentId, { expires: (365 * 10) });
		}
		info.text(description);
		if (infotimeout !== 0) {
			window.clearTimeout(infotimeout);
		}
		info.stop(true, true).fadeIn(0, function () {
			infotimeout = window.setTimeout(function () {
				if (infotimeout !== 0) {
					infotimeout = 0;
					info.stop(true, true).fadeOut('slow');
				}
			}, 5000);
		});
	}

	function loading() {
		var currentId = imageLoader.currentIndex();
		descriptionUpdate(currentId, "Loading (" + currentId + ")");
		loadingImage.css('z-index', 20);
	}

	function load1(callback) {
		var diff;
		tmpHeight = tmpImage.height() / 2;
		tmpWidth = tmpImage.width() / 2;
		// *=skippable if tmpimage >= image
		// adjust temp, *move image back, move temp forward, unhide, adjust description, 
		if (isLoading > 0) {
			tmpImage.css({
				'margin-top': '-' + tmpHeight + 'px',
				'margin-left': '-' + tmpWidth + 'px'
			});
			image.fadeOut(function () {
				if (tmpWidth < imageWidth || tmpWidth < imageHeight) {
					image.css('z-index', -10);
				}
				if (fullscreen) {
					diff = win.height() / 2;
				} else {
					diff = content.height() / 2;
				}
				diff -= tmpHeight;
				image.css('margin-top', diff > 0 ? diff : 0 + 'px');
			});
			tmpImage.css('z-index', 30);
			// Animate
			tmpImage.fadeIn(callback);
		}
	}

	function load2() {
		// adjust image, move load back, *move image forward, hide tmp, move temp back
		if (isLoading > 0) {
			loadingImage.css('z-index', -20);
			image.one('load', function () {
				if (tmpWidth < imageWidth || tmpWidth < imageHeight) {
					image.css('z-index', 10);
				}
				image.fadeIn(function () {
					tmpImage.fadeOut(0);
					// Make sure everything's in the right place
					tmpImage.css('z-index', -30);
					loadingImage.css('z-index', -20);
					image.css('z-index', 10);
					imageHeight = tmpHeight;
					imageWidth = tmpWidth;
					isLoading = 0;
				});
			});
		}
	}

	function loaded(url, index) {
		if (isLoading > 0) {
			descriptionUpdate(index, url.match(/.*\/(.+\..+)/)[1] + " (" + index + ")");
			load2();
			image.attr('src', url);
		}
	}

	function errored(url, index) {
		if (isLoading > 0) {
			descriptionUpdate(index, "Error Loading! " + url + " (" + index + ")");
			load2();
			image.attr('src', "http://www.csh.rit.edu/~nmoseley/img/image-error.gif");
		}
	}

	function loadImages() {
		var start;

		info.text("Loading . . . ");

		if (window.location.hash !== "") {
			start = parseInt(window.location.hash.substring(1), 10);
		} else if (minindex !== undefined) {
			start = minindex;
		} else {
			start = 10;
		}

		imageLoader = new ImageLoader(grabberURL, start, minindex, maxindex, limit,
			function () {
				var url = imageLoader.currentURL(),
					index = imageLoader.currentIndex();
				if (isLoading > 0) {
					// Reset the state of the page to "loading"
					image.unbind('onload').unbind('onerror');
					tmpImage.unbind('onload').unbind('onerror');
					image.stop(true, true).css({
						'z-index': 10,
						'opacity': ''
					}).fadeIn(0);
					tmpImage.stop(true).css({
						'z-index': -30,
						'opacity': ''
					}).fadeOut(0);
					loadingImage.css('z-index', 20);
				}
				isLoading = index;
				tmpImage.one('load', function () {
					load1(function () {
						loaded(url, index);
					});
				});
				tmpImage.one('error', function () {
					load1(function () {
						errored(url, index);
					});
				});
				tmpImage.attr('src', url);
				if (url === undefined) {
					url = "";
				}
				link.href = url;
			});
	}

	function nextImage() {
		if (maxindex !== undefined && imageLoader.currentIndex() + 1 > maxindex) {
			return;
		}
		if (imageLoader.next()) {
			isLoading = imageLoader.currentIndex();
			loading();
		}
	}

	function previousImage() {
		if (minindex !== undefined && imageLoader.currentIndex() - 1 < minindex) {
			return;
		}
		if (imageLoader.previous()) {
			isLoading = imageLoader.currentIndex();
			loading();
		}
	}

	function slideshow(forward) {
		slideshowforward = forward;
		if (slideshowId !== 0) {
			clearInterval(slideshowId);
			slideshowId = 0;
			play.button('toggle');
			playicon.removeClass('icon-stop').addClass('icon-play');
			playcollection.fadeOut();
		} else {
			if (forward) {
				slideshowId = setInterval(nextImage, slideshowdelay);
			} else {
				slideshowId = setInterval(previousImage, slideshowdelay);
			}
			play.button('toggle');
			playicon.removeClass('icon-play').addClass('icon-stop');
			playcollection.fadeIn();
		}
	}

	function slideshowreverse() {
		if (slideshowId === 0) {
			return;
		}
		slideshow(slideshowforward);
		slideshow(!slideshowforward);
		if (slideshowforward) {
			reverseicon.removeClass('icon-arrow-right').addClass('icon-arrow-left');
		} else {
			reverseicon.removeClass('icon-arrow-left').addClass('icon-arrow-right');
		}
	}

	function slideshowfaster() {
		if (slideshowId === 0) {
			return;
		}
		slideshowdelay -= 1000;
		if (slideshowdelay <= 0) {
			slideshowdelay = 1000;
		}
		slideshow(slideshowforward);
		slideshow(slideshowforward);
	}

	function slideshowslower() {
		if (slideshowId === 0) {
			return;
		}
		slideshowdelay += 1000;
		slideshow(slideshowforward);
		slideshow(slideshowforward);
	}

	function boxClick(e) {
		if (e.clientX < imagebox.offset().left + (imagebox.width() / 2)) {
			previousImage();
		} else {
			nextImage();
		}
	}

	function resize() {
		var diff;
		if (fullscreen) {
			wrapper.style.cssText = (maximized ? "min-" : "") + "height: 100% !important;";
			wrappercontainer.attr( 'style', "width: 100%;" );
			content[0].style.cssText = (maximized ? "min-" : "") + "height: 100%; padding: 0;";
			diff = win.height() / 2;
		} else {
			wrapper.style.cssText = (maximized ? "min-height: " + (window.innerHeight + header.height() + footer.height() + 2) + "px !important;" : "");
			wrappercontainer.attr( 'style', "" );
			content[0].style.cssText = (maximized ? "min-" : "") + "height: " + (window.innerHeight) + "px !important;";
			diff = content.height() / 2;
		}
		image.add(tmpImage).toggleClass('maxheight', !maximized);
		imageHeight = image.height() / 2;
		imageWidth = image.width() / 2;
		diff -= imageHeight;
		image.css('margin-top', diff > 0 ? diff : 0 + 'px');
		tmpImage.css('margin-top', '-' + tmpHeight + 'px').css('margin-left', '-' + tmpWidth + 'px');
		document.body.style.overflow = fullscreen && !maximized ? "hidden" : "";
		tmpHeight = tmpImage.height() / 2;
		tmpWidth = tmpImage.width() / 2;
		tmpImage.css('margin-top', '-' + tmpHeight + 'px').css('margin-left', '-' + tmpWidth + 'px');
	}

	function scrollWindow() {
		doc.scrollTop($(content).offset().top + 1);
	}

	function toggleFullscreen() {
		if (fullscreen) {
			$(menu).removeClass("hide");
			$(header).removeClass("hide");
			$(topb).removeClass("hide");
			$(push).removeClass("hide");
			$(footer).removeClass("hide");
			$(fullicon).removeClass("icon-resize-small").addClass("icon-resize-full");
		} else {
			$(menu).addClass("hide");
			$(header).addClass("hide");
			$(topb).addClass("hide");
			$(push).addClass("hide");
			$(footer).addClass("hide");
			$(fullicon).removeClass("icon-resize-full").addClass("icon-resize-small");
		}
		fullscreen = !fullscreen;
		resize();
		scrollWindow();
	}

	function toggleMaximize() {
		maximized = !maximized;
		maximize.button('toggle');
		resize();
	}

	function toggleBossMode() {
		bossmode = !bossmode;
		$(image).add(tmpImage).add(subheader).add(info).css('opacity', bossmode ? 0 : 1);
	}

	function processImages() {
		var showcollections, fadecollections;
		if (slideshowId !== undefined) {
			return;
		}
		controltimeout = 0;
		infotimeout = 0;

		bossmode = false;
		slideshowId = 0;
		slideshowforward = true;
		slideshowdelay = 3000;
		fullscreen = false;
		maximized = false;
		wrapper = document.getElementById('wrapper');
		wrappercontainer = $("#wrapper .container");
		menu = $('.navbar');
		header = $('#header');
		content = $('#content');
		containerbox = $('#containerbox');
		containerbox.on('click', boxClick);
		push = $('#push');
		footer = $('#footerwrapper');
		imagebox = $('#imagebox');
		linkbox = $('#linkbox');
		tmpImage = $('#tmpimage');
		errorHeight = tmpImage.height();
		tmpImage.fadeOut(0);
		image = $('#image');
		image.on('click', function (event) {
			event.stopPropagation();
		});
		loadingImage = $('#loadingimage');
		subheader = $('#header h5');
		link = document.getElementById('link');
		controls = $('#controls');
		info = $('#info');
		favorite = $('#favorite');
		favorite.on('click', function (event) {
			var url = window.location.href.split("#")[0],
				id, slash, text = info.text().split( "\n" )[0];
			descriptionUpdate( null, text + "\nTrying to save favorite." );
			slash = url.lastIndexOf("/", url.length - 2);
			id = url.substring( slash + 1, url.length - 1);
			url = url.substring( 0, slash + 1);
			$.post( url + '?id=' + id + '&url=' + encodeURIComponent( image.attr('src') ),
				function (data) {
					var text = info.text().split( "\n" )[0],
						data = $.parseJSON(data);
					if (data.url) {
						descriptionUpdate( null, text + "\nSaved image as favorite." );
					} else {
						descriptionUpdate( null, text + "\nFailed to save favorite. (" + data.error + ")" );
					}
				});
			event.stopPropagation();
		});
		full = $('#fullscreen');
		full.on('click', function (event) {
			if (typeof hidefunction !== 'undefined') {
				hidefunction();
			}
			toggleFullscreen();
			event.stopPropagation();
		});
		fullicon = $("#fullscreen i");
		topb = $('#top');
		topb.on('click', function (event) {
			if (typeof hidefunction !== 'undefined') {
				hidefunction();
			}
			scrollWindow();
			event.stopPropagation()
		});
		maximize = $('#maximize');
		maximize.on('click', function (event) {
			if (typeof hidefunction !== 'undefined') {
				hidefunction();
			}
			toggleMaximize();
			event.stopPropagation();
		});

		play = $('#play');
		play.on('click', function (event) {
			if (typeof hidefunction !== 'undefined') {
				hidefunction();
			}
			slideshow(slideshowforward);
			event.stopPropagation();
		});

		playicon = $("#play i");
		reverse = $('#reverse');
		reverse.on('click', function (event) {
			if (typeof hidefunction !== 'undefined') {
				hidefunction();
			}
			slideshowreverse();
			event.stopPropagation();
		});
		reverseicon = $("#reverse i");
		faster = $('#faster');
		faster.on('click', function (event) {
			if (typeof hidefunction !== 'undefined') {
				hidefunction();
			}
			slideshowfaster();
			event.stopPropagation();
		});
		slower = $('#slower');
		slower.on('click', function (event) {
			if (typeof hidefunction !== 'undefined') {
				hidefunction();
			}
			slideshowslower();
			event.stopPropagation();
		});

		prev = $('#previous');
		prev.on('click', function (event) {
			if (typeof hidefunction !== 'undefined') {
				hidefunction();
			}
			previousImage();
			event.stopPropagation();
		});
		next = $('#next');
		next.on('click', function (event) {
			if (typeof hidefunction !== 'undefined') {
				hidefunction();
			}
			nextImage();
			event.stopPropagation();
		});

		controlcollection = prev.add(next).add(topb).add(maximize).add(full).add(play).add(favorite);
		playcollection = reverse.add(faster).add(slower)
		navshown = 0;
		fadecollections = function () {
			var tmpcollection = slideshowId === 0 ? controlcollection : controlcollection.add(playcollection);
			if (infotimeout === 0) {
				tmpcollection = tmpcollection.add(info);
			}
			navshown = 0;
			// Stupid delay to stop a stupid problem where fadeOut would break to instant
			tmpcollection.stop(true, true).delay(10).fadeOut('slow');
		}
		showcollections = function (event) {
			var tmpcollection = slideshowId === 0 ? controlcollection.add(info) : controlcollection.add(playcollection).add(info);
			if (infotimeout !== 0) {
				window.clearTimeout(infotimeout);
			}
			infotimeout = 0;
			navshown++;
			tmpcollection.stop(true, true).fadeIn('fast', function () {
				var holdnavshown = navshown;
				if (controltimeout !== 0) {
					window.clearTimeout(controltimeout);
				}
				controltimeout = window.setTimeout(function () {
					if (navshown == holdnavshown) {
						fadecollections();
					}
				}, 5000);
			});
		};
		controlcollection.add(playcollection).add(info).on('mouseenter', function (event) {
			if (infotimeout !== 0) {
				window.clearTimeout(infotimeout);
			}
			if (controltimeout !== 0) {
				window.clearTimeout(controltimeout);
			}
			infotimeout = 0;
			controltimeout = 0;
		});
		controlcollection.add(playcollection).add(info).on('mousemove', function (event) {
			event.stopPropagation();
		});
		controlcollection.add(playcollection).add(info).on('mouseleave', function (event) {
			fadecollections();
		});
		containerbox.on('mouseenter', function (event) {
			showcollections();
		});
		containerbox.on('mousemove', function (event) {
			showcollections();
		});
		containerbox.on('mouseleave', function (event) {
			fadecollections();
		});
		containerbox.trigger('mousemove');
		resize();

		loadImages();
	}

	function doCookie() {
		var i, date, cookie, cookies = document.cookie.split(';');
		for (i = 0; i < cookies.length; ++i) {
			cookie = cookies[i];
			while (cookie.charAt(0) === ' ') {
				cookie = cookie.substring(1, cookie.length);
			}
			if (cookie.indexOf("lastseen=") === 0) {
				if (window.location.hash === '') {
					window.location.hash = '#' + cookie.substring(9, cookie.length);
				}
				return;
			}
		}
	}

	$(function () {
		doCookie();
		processImages();

		doc.on('keydown', function (event) {
			if (!(event.altKey || event.ctrlKey)) {
				switch (event.keyCode) {
				case 27:
				case 66:
					toggleBossMode();
					return false;
				case 84:
					scrollWindow();
					return false;
				case 77:
					toggleMaximize();
					return false;
				case 70:
					toggleFullscreen();
					return false;
				case 80:
					slideshow(slideshowforward);
					return false;
				case 86:
					slideshowreverse();
					return false;
				case 107:
					slideshowfaster();
					return false;
				case 61:
					if (event.shiftKey) {
						slideshowfaster();
						return false;
					}
					break;
				case 109:
					slideshowslower();
					return false;
				case 32:
					if (event.shiftKey) {
						previousImage();
					} else {
						nextImage();
					}
					return false;
				case 37:
					previousImage();
					return false;
				case 39:
					nextImage();
					return false;
				}
			}
		});

		// TODO how to handle mobile here
		if (false) {
			hidefunction = function () {
				if (mobiletimeout !== 0) {
					window.clearTimeout(mobiletimeout);
				}
				mobiletimeout = window.setTimeout(function () {
					controls.hide(0);
				}, 5000);
			};

			doc.on('taphold', function (event) {
				event.preventDefault();
				controlcollection.add(playcollection).add(info).show(0, function() {
					hidefunction();
				});
			});

			doc.on('swiperight', function (event) {
				event.preventDefault();
				previousImage();
			});
			doc.on('swipeleft', function (event) {
				event.preventDefault();
				nextImage();
			});
		}

		win.resize(function () {
			resize();
		});

		win.hashchange(function () {
			var hash = parseInt(window.location.hash.substring(1), 10), current;
			if (isNaN(hash)) {
				return;
			}
			current = imageLoader.currentIndex();
			if (minindex !== undefined && hash < minindex) {
				hash = minindex;
			} else if (maxindex !== undefined && hash > maxindex) {
				hash = maxindex;
			}
			if (hash === current) {
				return;
			}
			if (hash === current - 1) {
				previousImage();
			} else if (hash === current + 1) {
				nextImage();
			} else {
				imageLoader.goTo(hash);
				loading();
			}
		});

	});
}());
