$(function () {
	"use strict";
	var fetchURL = "viewer/sankakucomplex/?id=",
		loadingURL = "img/image-loading.gif",
		images = [],
		min = -1,
		max = -1,
		current,
		/*
		prev1 = $('#prev1'),
		prev2 = $('#prev2'),
		next1 = $('#next1'),
		next2 = $('#next2'),
		*/
		currim = $('#current');

	function binsearch(array, key, imin, imax) {
		var imid;
		if (imax < imin) {
			return imin;
		}
		imid = Math.floor((imin + imax) / 2);
		if (key > array[imid]) {
			return binsearch(array, key, imin, imid - 1);
		} else if (key < array[imid]) {
			return binsearch(array, key, imid + 1, imax);
		} else {
			return imid;
		}
	}

	function updateArray() {
		var url, query;
		url = window.location.href.split("?");
		if (url.length > 1) {
			query = url[1];
		}
		url = url[0];
		$.getJSON(url + "?" + query + "&json=", function (json) {
			var nextarr, img, lmin, lmax, i;
			lmin = json[json.length - 1].id;
			lmax = json[0].id;
			if (min === -1) {
				min = lmin;
				max = lmax;
				images = json;
				images.reverse();
				/*
				for (i in images) {
					img = new Image();
					img.src = images[i].preview_url;
					images[i].preview = img;
				}
				*/
				current = Math.floor(images.length / 4);
				updateSlideshow(current);
			} else if (lmax > max) {
				nextarr = json.slice(0, binsearch(json, max, 0, json.length - 1) - 1).reverse();
				/*
				for (i in nextarr) {
					img = new Image();
					img.src = images[i].preview_url;
					images[i].preview = img;
				}
				*/
				images = images.concat(nextarr);
				max = lmax;
			}
		});
	}

	function updateImg(elem, url, tags, height, width) {
		elem.attr('src', url);
		elem.attr('alt', tags);
		elem.one({
			'load': function () {
				elem.css({
					'height': height,
					'width': width
				});
			},
			'error': function () {
				elem.css({
					'height': 10,
					'width': 10
				});
			}
		});
	}

	function updateSlideshow(index) {
		var update = false;
		console.log(new Date().getTime(), "updateSlideshow()");
		$.get(fetchURL + images[index].id, function (data) {
			var loadimg = new Image(),
				timeout = false;

			loadimg.onload = loadimg.onerror = function () {
				if (timeout !== false) {
					return;
				}
				timeout = window.setTimeout(function () {
					if (index !== images.length - 1) {
						current = index + 1;
					}
					timeout = false;
					updateSlideshow(current);
				}, 5000);

				updateImg(currim, data, images[index].tags, images[index].height, images[index].width);

				/*
				if (index - 2 >= 0) {
					updateImg(prev2, images[index - 2].preview_url, images[index - 2].tags, images[index - 2].preview_height, images[index - 2].preview_width);
				}
				if (index - 1 >= 0) {
					updateImg(prev1, images[index - 1].preview_url, images[index - 1].tags, images[index - 1].preview_height, images[index - 1].preview_width);
				}
				if (index + 1 <= max) {
					updateImg(next1, images[index + 1].preview_url, images[index + 1].tags, images[index + 1].preview_height, images[index + 1].preview_width);
				} else {
					updateImg(next1, loadingURL, "", 66, 66);
					update = true;
				}
				*/
				if (index + 2 <= max) {
//                    updateImg(next2, images[index + 2].preview_url, images[index + 2].tags, images[index + 2].preview_height, images[index + 2].preview_width);
				} else {
//                    updateImg(next2, loadingURL, "", 66, 66);
					update = true;
				}
				if (update) {
					updateArray();
				}
			};

			loadimg.src = data;
		});
	}

	updateArray();

});
