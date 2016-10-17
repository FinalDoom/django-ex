(function(window) {
var
	// Namespace Object for holding functions and such
	fd = window.FinalDoom = window.FinalDoom || {},

	// The Imager object
	Imager,
	
	// Function for removing a class from an element
	removeClass,
	
	// Function for adding events to the window
	addEvent,

	// Function for making a mouseout that ignores mouseout when moving over child elements
	makeMouseOutFn,
	
	// Function for getting an element and its children in a list
	traverseChildren,
	
	// Function for checking if a url is pointing to an image
	isImageURL,
	
	// Function to check if an array doesn't contain a value
	doesntContain,

	// Function to get an attribute from an element
	getAttr,
	
	// Function to convert local coords to window coords
	localToGlobal;

Array.prototype.move = function(old_index, new_index) {
	if (new_index >= this.length) {
		var k = new_index - this.length;
		while ((k--) + 1) {
			this.push(undefined);
		}
	}
	this.splice(new_index, 0, this.splice(old_index, 1)[0]);
	return this;
}

addEvent = fd.addEvent = fd.addEvent || function (obj, type, fn) {
	if (obj.addEventListener) {
		obj.addEventListener( type, fn, false );
	} else if (obj.attachEvent) {
		obj.attachEvent('on'+type, fn);
	} else {
		obj['on'+type] = fn;
	}
};

removeEvent = fd.removeEvent = fd.removeEvent || function (obj, type, fn) {
	if (obj.removeEventListener) {
		obj.removeEventListener(type, fn, false);
	} else if (obj.detachEvent) {
		obj.detachEvent('on'+type, fn);
	} else {
		obj['on'+type] = null;
	}
};

removeClass = fd.removeClass = fd.removeClass || function (elem, cls) {
	elem.className = elem.className.replace(new RegExp('(?:^|\\s)' + cls + '(?!\\S)', 'g'), '');
};

makeMouseOutFn = fd.makeMouseOutFn = fd.makeMouseOutFn || function (elem, callback) {
    var fd = window.FinalDoom,
		list = fd.traverseChildren(elem);
    return function onmouseout(event) {
        var e = event.toElement || event.relatedTarget;
        if (!!~list.indexOf(e)) {
            return;
        }
		callback(event);
	};
};

traverseChildren = fd.traverseChildren = fd.traverseChildren || function (elem) {
    var children = [],
		q = [],
		i;

	function pushAll(elemArray){
		for(i = 0; i < elemArray.length; i++) {
			q.push(elemArray[i]);
		}

	}

    q.push(elem);
    while (q.length > 0) {
        elem = q.pop();
        children.push(elem);
        pushAll(elem.children);
    }
	return children;
};

isImageURL = fd.isImageURL = fd.isImageURL || function (url) {
	var urlSplit = url.split('.'), 
		extensionSplit = urlSplit[urlSplit.length - 1].split('?'),
		extension = extensionSplit[0].toLowerCase();
	return {
		gif: 1,
		jpg: 1,
		jpeg: 1,
		png: 1,
		mng: 1,
		apng: 1,
		svg: 1,
		xbm: 1
	}[extension];
};

doesntContain = fd.doesntContain = fd.doesntContain || function (array, value) {
	var i;
	if (array.indexOf) {
		return !~array.indexOf(value);
	}
	for (i = 0; i < array.length; ++i) {
		if (array[i] === value) {
			return false;
		}
	}
	return true;
};

getAttr = fd.getAttr = fd.getAttr || function(ele, attr) {
	var result = (ele.getAttribute && ele.getAttribute(attr)) || null,
		attrs,
		length;
	if( !result ) {
		attrs = ele.attributes;
		length = attrs.length;
		for(var i = 0; i < length; i++) {
			if(attrs[i].nodeName === attr) {
				result = attrs[i].nodeValue;
				break;
			}
		}
	}
	return result;
}

localToGlobal = fd.localToGlobal = fd.localToGlobal || function (elem) {
	var target = elem,
		width = target.offsetWidth,
		height = target.offsetHeight,
		left = target.offsetLeft,
		top = target.offsetTop,
		gleft = 0,
		gtop = 0,
		rect = {},
		moonwalk;
	moonwalk = function (parent) {
		if (!!parent) {
			gleft += parent.offsetLeft;
			gtop += parent.offsetTop;
			moonwalk(parent.offsetParent);
		} else {
			return rect = {
				top: target.offsetTop + gtop,
				left: target.offsetLeft + gleft,
				bottom: (target.offsetTop + gtop) + height,
				right: (target.offsetLeft + gleft) + width,
				height: height,
				width: width
			};
		}
	};
	moonwalk(target.offsetParent);
	return rect;
}

// Ideas: put slideshow in its own sub object
// put the preloader in its own sub object
// navigation in its own? ....

Imager = fd.Imager = fd.Imager || function () {
	// Slideshow
	this.slideshowId = 0;
	this.slideshowDelay = 4000;
	this.slideshowForward = true;
	// Image indices
	this.currentImage = 0;
	// Statuses
	this.loadingPaused = false;
	this.mouseInside = false;
	this.mouseInImg = false;
	this.attempt = 1;
	// Namespace reference
	this.fd = fd;

	if (window.location.protocol === "file:") {
		this.fd.delay = 0;
	}

	this.viewerSetup();
};

Imager.fn = Imager.prototype = {
	constructor: Imager,

	pauseLoading: function () {
		if (this.loadingPaused) {
			this.loadingPaused = false;
			window.setTimeout(this.doPreload.bind(this));
		} else {
			this.loadingPaused = true;
		}
	},

	showLoaded: function () {
		var currentText = (this.currentImage+1) + " / " + this.linksArray.length,
			loadingText = Math.floor( (this.linksArray.length - this.loadQueue.length) / this.linksArray.length * 100);
		if (this.isLoading) {
			if (this.loadQueue.length == 0) {
				this.progress.innerHTML = loadingText + "% Loaded\t" + (this.currentImage+1) + " / " + this.linksArray.length;
				this.progress.title = "";
				window.setTimeout(function () {this.isLoading = false;this.showLoaded();this.progress.onclick='';}.bind(this), 3000);
			} else if (this.loadingPaused) {
				this.progress.innerHTML = "Paused... " + loadingText + "% \t" + currentText;
				this.progress.title = "Resume Loading";
			} else {
				this.progress.innerHTML = "Loading... " + loadingText + "% \t" + currentText;
				this.progress.title = "Pause Loading";
			}
		} else {
			this.progress.innerHTML = currentText;
		}
	},

	showImage: function () {
		this.imageLink.href = this.linksArray[this.currentImage];
		this.imageLink.setAttribute("onclick", this.linkInfoArray[this.currentImage].onclick);
		if (this.imagesArray[this.currentImage] !== undefined && this.imagesArray[this.currentImage].complete) {
			this.image.src = this.linksArray[this.currentImage];
			this.image.setAttribute('alt', this.imageInfoArray[this.currentImage].alt);
		} else {
			this.image.src = "data:image/gif;base64,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%3D%3D";
			this.image.setAttribute('alt', "");
		}
		this.showLoaded();
		if (typeof this.oldonresize === "function") {
			this.oldonresize();
		}
	},

	changeCurrent: function (index) {
		var curThumb = this.thumbnailsArray[this.currentImage];
		if (curThumb) {
			curThumb.style.background = "transparent";
		}
		this.currentImage = index;
		curThumb = this.thumbnailsArray[this.currentImage];
		if (curThumb) {
			curThumb.style.background = "rgba(1,1,1,.2)";
			if (curThumb.offsetTop < this.thumbnailBox.scrollTop) {
				this.thumbnailBox.scrollTop = curThumb.offsetTop;
			} else if (curThumb.offsetTop + curThumb.offsetHeight > this.thumbnailBox.scrollTop + this.thumbnailBox.offsetHeight) {
				this.thumbnailBox.scrollTop = curThumb.offsetTop + curThumb.offsetHeight - this.thumbnailBox.offsetHeight;
			}
		}
		this.showImage();
	},

	nextImage: function () {
		if (this.currentImage < this.linksArray.length - 1) {
			this.changeCurrent(this.currentImage + 1);
		} else {
			this.changeCurrent(0);
		}
	},

	previousImage: function () {
		if (this.currentImage >= 1) {
			this.changeCurrent(this.currentImage - 1);
		} else {
			this.changeCurrent(this.linksArray.length - 1);
		}
	},

	reloadImage: function () {
		this.imagesArray[this.currentImage].src = this.linksArray[this.currentImage] + "?" + (new Date()).getTime();
		this.showImage()
	},

	boxClick: function (e) {
		if (e.clientX < this.displayBox.offsetLeft + (this.displayBox.offsetWidth / 2)) {
			this.previousImage();
		} else {
			this.nextImage();
		}
	},

	slideshow: function (forward) {
		this.slideshowForward = forward;
		if (this.slideshowId !== 0) {
			clearInterval(this.slideshowId);
			this.slideshowId = 0;
			this.playButton.style.color = "inherit";
			this.playButton.title = "Play (p)";
			this.slideshowDiv.style.right = "-" + this.playingDiv.offsetWidth + "px";
		} else {
			if (forward) {
				this.slideshowId = setInterval(this.nextImage.bind(this), this.slideshowDelay);
			} else {
				this.slideshowId = setInterval(this.previousImage.bind(this), this.slideshowDelay);
			}
			this.playButton.style.color = "#99FF99";
			this.playButton.title = "Stop (p)";
			this.slideshowDiv.style.right = "0";
		}
	},

	slideshowreverse: function () {
		this.reverseButton.innerHTML = this.slideshowForward ? "&rarr;" : "&larr;";
		this.reverseButton.title = this.slideshowForward ? "Forward (v)" : "Reverse (v)";
		this.slideshow(this.slideshowForward);
		this.slideshow(!this.slideshowForward);
	},

	slideshowfaster: function () {
		this.slideshowDelay -= 1000;
		if (this.slideshowDelay <= 0) {
			this.slideshowDelay = 1000;
		}
		this.slideshow(this.slideshowForward);
		this.slideshow(this.slideshowForward);
	},

	slideshowslower: function () {
		this.slideshowDelay += 1000;
		this.slideshow(this.slideshowForward);
		this.slideshow(this.slideshowForward);
	},

	limgmousemove: function (event) {
		if (this.mouseInside && !this.mouseInImg) {
			if (event.clientX < this.thumbnailBox.offsetWidth) {
				this.fd.removeClass(this.nextButtonRegion, 'show');
				this.fd.removeClass(this.previousButtonRegion, 'show');
				this.nextButtonRegion.style.opacity = '0';
				this.previousButtonRegion.style.opacity = '0';
				this.thumbnailBox.style.opacity = '1';
				if (event.clientX >= this.thumbnailBox.offsetWidth - 4) {
					this.thumbnailBox.style.cursor = "e-resize";
				} else {
					this.thumbnailBox.style.cursor = "auto";
				}
			} else if (event.clientX < this.thumbnailBox.offsetWidth + ((this.displayBox.offsetWidth - this.thumbnailBox.offsetWidth) / 2)) {
				if (this.previousButtonRegion.style.opacity != '1') {
					this.previousButtonRegion.className += " show";
					this.previousButtonRegion.style.opacity = '1';
				}
				if (this.nextButtonRegion.style.opacity != '0') {
					this.fd.removeClass(this.nextButtonRegion, 'show');
					this.nextButtonRegion.style.opacity = '0';
				}
				this.thumbnailBox.style.opacity = '0.3';
			} else {
				if (this.nextButtonRegion.style.opacity != '1') {
					this.nextButtonRegion.className += " show";
					this.nextButtonRegion.style.opacity = '1';
				}
				if (this.previousButtonRegion.style.opacity != '0') {
					this.fd.removeClass(this.previousButtonRegion, 'show');
					this.previousButtonRegion.style.opacity = '0';
				}
				this.thumbnailBox.style.opacity = '0.3';
			}
		} else {
			if (this.previousButtonRegion.style.opacity != '0') {
				this.fd.removeClass(this.previousButtonRegion, 'show');
				this.previousButtonRegion.style.opacity = '0';
			}
			if (this.nextButtonRegion.style.opacity != '0') {
				this.fd.removeClass(this.nextButtonRegion, 'show');
				this.nextButtonRegion.style.opacity = '0';
			}
			this.thumbnailBox.style.opacity = '0.3';
		}
		if (typeof this.oldonmousemove === "function") {
			this.oldonmousemove(event);
		}
	},

	clickThrough: function (event, on) {
		this.displayBox.style.pointerEvents = on ? 'none' : 'auto';
		this.displayBox.style.background = on ? '-webkit-radial-gradient(circle, rgba(0,0,0,0), rgba(0,0,0,.3))' : 'rgba(0,0,0,.5)';
		this.image.style.opacity = on ? '0.2' : '1';
		this.thumbnailBox.style.opacity = this.cornerDiv.style.opacity = this.slideshowDiv.style.opacity = on ? '0' : '1';
		if (on) {
			this.fd.removeClass(this.previousButtonRegion, 'show');
			this.fd.removeClass(this.nextButtonRegion, 'show');
			this.nextButtonRegion.style.opacity = this.previousButtonRegion.style.opacity = '0';
			this.fd.removeEvent(document, 'mousemove', this.dragListener);
			this.fd.removeEvent(document, 'touchmove', this.dragListener);
			this.fd.removeEvent(document, 'mouseup', this.dropListener);
			this.fd.removeEvent(document, 'touchend', this.dropListener);
			this.fd.removeEvent(document, 'mousemove', this.thumbnailResizeListener);
			this.fd.removeEvent(document, 'touchmove', this.thumbnailResizeListener);
			this.fd.removeEvent(document, 'mouseup', this.thumbnailDropListener);
			this.fd.removeEvent(document, 'touchend', this.thumbnailDropListener);
		} else {
			this.limgmousemove(event);
		}
	},

	clickImage: function () {
		var evObj = document.createEvent('HTMLEvents');
		evObj.initEvent('click', true, true);
		this.imageLink.dispatchEvent(evObj);
	},

	removeImage: function (back) {
		this.thumbnailBox.removeChild(this.thumbnailsArray[this.currentImage]);
		this.thumbnailsArray.splice(this.currentImage, 1);
		this.linksArray.splice(this.currentImage, 1);
		this.linkInfoArray.splice(this.currentImage, 1);
		this.imageInfoArray.splice(this.currentImage, 1);
		this.imagesArray.splice(this.currentImage, 1);
		if (back) {
			this.previousImage();
		} else {
			this.currentImage--;
			this.nextImage();
		}
	},

	thumbnailGrab: function (event) {
		var evt = event || window.event,
			mouseButton,
			coords;
		evt.cancelBubble = true;
		if (evt.stopPropagation) {
			evt.stopPropagation();
		}
		if (evt.which) {
			mouseButton = evt.which;
		} else {
			mouseButton = evt.button;
		}
		if (!evt.touches && mouseButton !== 1) {
			return true;
		}
		this.movingThumbnail = evt.target || evt.srcElement;
		while (this.movingThumbnail && this.movingThumbnail.parentNode !== this.thumbnailBox) {
			this.movingThumbnail = this.movingThumbnail.parentNode;
		}
		this.changeCurrent(this.thumbnailsArray.indexOf(this.movingThumbnail));
		coords = fd.localToGlobal(this.movingThumbnail);
		this.movingThumbnail.style.left = coords.left + "px";
		this.movingThumbnail.style.top = (coords.top - this.thumbnailBox.scrollTop) + "px";
		this.movingThumbnail.style.width = coords.width + "px";
		this.movingThumbnail.style.height = coords.height + "px";
		// Make a wrapper to move, leaving the div for placeholding
		this.movingThumbnail.innerHTML = "<div>" + this.movingThumbnail.innerHTML + "</div>";
		this.movingThumbnail = this.movingThumbnail.firstChild;
		this.movingThumbnail.style.left = coords.left + "px";
		this.movingThumbnail.style.top = (coords.top - this.thumbnailBox.scrollTop) + "px";
		this.movingThumbnail.style.width = coords.width + "px";
		this.movingThumbnail.style.height = coords.height + "px";
		this.movingThumbnail.style.position = "fixed";
		this.movingThumbnail.boundTop = this.movingThumbnail.offsetTop - this.movingThumbnail.offsetHeight / 2 + this.thumbnailBox.scrollTop;
		this.movingThumbnail.boundBottom = this.movingThumbnail.offsetTop + this.movingThumbnail.offsetHeight / 2 + this.thumbnailBox.scrollTop;
		if (window.getSelection) {
			window.getSelection().removeAllRanges();
		} else if (document.selection && document.selection.type === "Text") {
			try {
				document.selection.empty();
			} catch (error) {}
		}
		if (evt.touches) {
			this.Y = evt.touches[0].clientY;
		} else {
			this.Y = evt.clientY;
		}
		this.fd.addEvent(document, 'mousemove', this.dragListener);
		this.fd.addEvent(document, 'touchmove', this.dragListener);
		this.fd.addEvent(document, 'mouseup', this.dropListener);
		this.fd.addEvent(document, 'touchend', this.dropListener);
	},

	dragThumbnail: function (event) {
		var evt = event || window.event,
			Y,
			toppos,
			bottompos,
			newpos;
		if (evt.touches) {
			Y = evt.touches[0].clientY;
		} else {
			Y = evt.clientY;
		}
		newpos = (parseInt(this.movingThumbnail.style.top) + Y - this.Y);
		this.movingThumbnail.style.top = newpos + "px"
		// Prevent selections
		if (window.getSelection) {
			window.getSelection().removeAllRanges();
		} else if (document.selection && document.selection.type === "Text") {
			try {
				document.selection.empty();
			} catch (error) {}
		}
		if (newpos < toppos + 10) {
			// Scroll up
			this.scrollBy = Math.min(-1, newpos - toppos + 10);
			this.thumbnailScroll();
		} else if (newpos > bottompos - 10) {
			this.scrollBy =  Math.max(1, bottompos - newpos - 10);
			this.thumbnailScroll();
		} else {
			this.scrollBy = null;
		}

		// Move up in list
		if (this.movingThumbnail.offsetTop + this.thumbnailBox.scrollTop < this.movingThumbnail.boundTop) {
			this.moveThumbnail(this.movingThumbnail.offsetTop + this.thumbnailBox.scrollTop);// + this.movingThumbnail.offsetHeight / 4);
		}
//         Move down in list
		if (this.movingThumbnail.offsetTop + this.thumbnailBox.scrollTop > this.movingThumbnail.boundBottom) {
			this.moveThumbnail(this.movingThumbnail.offsetTop + this.thumbnailBox.scrollTop);// + 3 * this.movingThumbnail.offsetHeight / 4);
		}
		this.Y = Y;
	},

	dropThumbnail: function (event) {
		this.movingThumbnail.style.position = "static";
		this.movingThumbnail.parentNode.innerHTML = this.movingThumbnail.innerHTML;
		delete this.movingThumbnail;
		this.scrollBy = null;
		this.fd.removeEvent(document, 'mousemove', this.dragListener);
		this.fd.removeEvent(document, 'touchmove', this.dragListener);
		this.fd.removeEvent(document, 'mouseup', this.dropListener);
		this.fd.removeEvent(document, 'touchend', this.dropListener);
	},

	thumbnailScroll: function () {
		var scrollTop;
		if (this.scrollBy) {
			scrollTop = this.thumbnailBox.scrollTop;
			this.thumbnailBox.scrollTop += this.scrollBy;
			this.movingThumbnail.style.top = (this.movingThumbnail.offsetTop - this.movingThumbnail.startTop + this.thumbnailBox.scrollTop - scrollTop) + "px";
			window.setTimeout(this.thumbnailScroll.bind(this), 20);
		}
	},

	moveThumbnail: function (checkPos) {
		var movingDiv,
			startidx,
			idx,
			beforeNode;
		movingDiv = this.movingThumbnail.parentNode;
		startidx = idx = this.thumbnailsArray.indexOf(movingDiv);
		if (checkPos < this.movingThumbnail.boundTop) {
			while (idx >= 0 && checkPos < this.thumbnailsArray[idx--].offsetTop) { }
			idx++;
			beforeNode = this.thumbnailsArray[idx];
		} else if (checkPos > this.movingThumbnail.boundBottom) {
			while (idx < this.thumbnailsArray.length - 1 && checkPos > this.thumbnailsArray[++idx].offsetTop) { }
			beforeNode = this.thumbnailsArray[idx].nextSibling;
		}
		if (startidx === idx) {
			return;
		}
		this.thumbnailBox.removeChild(movingDiv);
		this.thumbnailBox.insertBefore(movingDiv, beforeNode);
		this.movingThumbnail.boundTop = movingDiv.offsetTop - this.movingThumbnail.offsetHeight / 2;
		this.movingThumbnail.boundBottom = movingDiv.offsetTop + this.movingThumbnail.offsetHeight / 2;
		this.thumbnailsArray.move(startidx, idx);
		this.linksArray.move(startidx, idx);
		this.linkInfoArray.move(startidx, idx);
		this.imageInfoArray.move(startidx, idx);
		this.imagesArray.move(startidx, idx);
		this.changeCurrent(idx);
	},

	thumbnailsResizeGrab: function (event) {
		var evt = event || window.event,
			mouseButton,
			coords;
		evt.cancelBubble = true;
		if (evt.stopPropagation) {
			evt.stopPropagation();
		}
		if (evt.which) {
			mouseButton = evt.which;
		} else {
			mouseButton = evt.button;
		}
		if (!evt.touches && mouseButton !== 1) {
			return true;
		}
		if (window.getSelection) {
			window.getSelection().removeAllRanges();
		} else if (document.selection && document.selection.type === "Text") {
			try {
				document.selection.empty();
			} catch (error) {}
		}
		if (evt.touches) {
			this.X = evt.touches[0].clientX;
		} else {
			this.X = evt.clientX;
		}
		this.thumbnailBox.style.width = (this.thumbnailBox.offsetWidth - 4) + "px";
		this.fd.addEvent(document, 'mousemove', this.thumbnailResizeListener);
		this.fd.addEvent(document, 'touchmove', this.thumbnailResizeListener);
		this.fd.addEvent(document, 'mouseup', this.thumbnailDropListener);
		this.fd.addEvent(document, 'touchend', this.thumbnailDropListener);
	},

	thumbnailsResize: function (event) {
		var evt = event || window.event,
			X,
			toppos,
			bottompos,
			newpos;
		if (evt.touches) {
			X = evt.touches[0].clientX;
		} else {
			X = evt.clientX;
		}
		newwidth = (parseInt(this.thumbnailBox.style.width) + X - this.X);
		this.thumbnailBox.style.width = newwidth + "px";
		this.previousButtonRegion.style.left = newwidth + "px";
		this.displayBox.style.paddingLeft = (newwidth / 2) + "px";
		// Prevent selections
		if (window.getSelection) {
			window.getSelection().removeAllRanges();
		} else if (document.selection && document.selection.type === "Text") {
			try {
				document.selection.empty();
			} catch (error) {}
		}
		this.X = X;
	},

	thumbnailsResizeDrop: function (event) {
		this.fd.removeEvent(document, 'mousemove', this.thumbnailResizeListener);
		this.fd.removeEvent(document, 'touchmove', this.thumbnailResizeListener);
		this.fd.removeEvent(document, 'mouseup', this.thumbnailDropListener);
		this.fd.removeEvent(document, 'touchend', this.thumbnailDropListener);
	},

	closeViewer: function () {
		if (this.slideshowId !== 0) {
			this.slideshow(true);
		}
		this.displayBox.style.display = 'none';
		document.onclick = this.oldonclick;
		document.onkeydown = this.oldonkeydown;
		document.onkeyup = this.oldonkeyup;
		document.onmousemove = this.oldonmousemove;
		window.onresize = this.oldonresize;
		this.changeCurrent(0);
		this.image.src = '';
		this.closed = true;
	},

	// On- functions
	limgonkeydown: function (event) {
		var ret;
		if (event.keyCode === 27) {
			if (event.shiftKey) {
				this.destroy();
			} else {
				this.closeViewer();
			}
			ret = false;
		} else if (event.charCode === 112) {
			this.slideshow(true);
			ret = false;
		} else if (event.charCode === 80) {
			this.slideshow(false);
			ret = false;
		} else if (event.keyCode === 80) {
			this.slideshow(event.shiftKey);
			ret = false;
		} else if (event.charCode === 118 || event.keyCode === 86) {
			this.slideshowreverse();
			ret = false;
		} else if (event.charCode === 43 || event.charCode === 102 ||
				event.keyCode === 187 || event.keyCode === 107) {
			this.slideshowfaster();
			ret = false;
		} else if (event.charCode === 45 || event.charCode === 115 ||
				event.keyCode === 189 || event.keyCode === 109) {
			this.slideshowslower();
			ret = false;
		} else if (((event.charCode === 32  || event.keyCode === 32) && event.shiftKey)
				|| event.keyCode === 37) {
			this.previousImage();
			event.preventDefault();
			ret = false;
		} else if (((event.charCode === 32 || event.keyCode === 32) && !event.shiftKey)
				|| event.keyCode === 39) {
			this.nextImage();
			event.preventDefault();
			ret = false;
		} else if (event.charCode === 114 || event.keyCode === 82) {
			this.reloadImage();
			ret = false;
		} else if (event.keyCode === 8) {
			event.preventDefault();
			this.removeImage(true);
			ret = false;
		} else if (event.keyCode === 46) {
			this.removeImage(false);
			ret = false;
		} else if (event.keyCode === 13) {
			this.clickImage();
			ret = false;
		} else if (event.keyCode === 17) {
			this.clickThrough(event, true);
			ret = false
		} else if (typeof this.oldonkeydown === "function") {
			ret = this.oldonkeydown(event);
		}
		return ret;
	},

	limgonkeyup: function (event) {
		var ret;
		if (event.keyCode === 17) {
			this.clickThrough(event, false);
			ret = false;
		} else if (typeof this.oldonkeyup === "function") {
			ret = this.oldonkeyup(event);
		}
		return ret;
	},

	limgonclick: function (event) {
		var ret;
		if (event.target === this.closeButton) {
			if (event.shiftKey) {
				this.destroy();
			} else {
				this.closeViewer();
			}
			ret = false;
		} else if (event.target === this.displayBox) {
			this.boxClick(event);
			ret = false;
		} else if (event.target === this.playButton) {
			if (event.shiftKey) {
				this.slideshow(false);
			} else {
				this.slideshow(true);
			}
			ret = false;
		} else if (event.target === this.reverseButton) {
			this.slideshowreverse();
			ret = false;
		} else if (event.target === this.fasterButton) {
			this.slideshowfaster();
			ret = false;
		} else if (event.target === this.slowerButton) {
			this.slideshowslower();
			ret = false;
		} else if (event.target === this.nextButton || event.target === this.nextButtonRegion) {
			this.nextImage();
			ret = false;
		} else if (event.target === this.previousButton || event.target === this.previousButtonRegion) {
			this.previousImage();
			ret = false;
		} else if (typeof this.oldonclick === "function") {
			ret = this.oldonclick(event);
		}
		return ret;
	},

/* Iframe method */
	finishPreload: function (index) {
		this.imagesArray[index] = new Image();
		this.imagesArray[index].src = this.linksArray[index];
		this.imagesArray[index].onerror = function () {
			this.loadQueue.push(index);
			setTimeout(this.doPreload.bind(this), fd.delay + Math.random() * fd.delay * this.attempt * 2 + Math.random() * fd.delay * this.attempt * 2);
		}.bind(this);
		this.imagesArray[index].onload = function () {
			var iframeDoc,
				iframeImage;
			if (this.linkInfoArray[index].iframeSrc !== undefined && this.iframe !== undefined) {
				iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document,
				iframeImage = iframeDoc.getElementById('image');
				if (!iframeImage || iframeImage.height != this.imagesArray[index].height ||
						iframeImage.width != this.imagesArray[index].width) {
					this.loadQueue.push(index);
				}
			}
			setTimeout(this.doPreload.bind(this), window.location.proocol === "file:" ? 0 : fd.delay === undefined ? 100 : 2500 + fd.delay);
		}.bind(this);
	},

	doPreload: function () {
		var index,
			iframeDoc,
			iframeImage;
		this.showLoaded();
		if (this.loadingPaused || this.closed) {
			return;
		}
		index = this.loadQueue.shift();
		if (index === undefined) {
			return;
		}
		if (this.iframe === undefined) {
			setTimeout(function () {this.finishPreload(index);}.bind(this), this.fd.delay);
		}
		if (this.linkInfoArray[index].iframeSrc !== undefined) {
			
			iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
			var inter = setTimeout(function() {
				if (iframeDoc.readyState = "complete") {
					window.clearInterval(inter);
					iframeImage = iframeDoc.getElementById("image");
					if (iframeImage != null) {
						iframeImage.onload = function () {
							this.finishPreload(index);
						};
						iframeImage.onerror = function () {
							this.attempt += 2;
							this.loadQueue.push(index);
							setTimeout(this.doPreload.bind(this), fd.delay + Math.random() * fd.delay * this.attempt * 2 + Math.random() * fd.delay * this.attempt * 2);
						}.bind(this);
					} else {
						setTimeout(function () {this.finishPreload(index);}.bind(this), this.fd.delay);
					}
				}
			}.bind(this), 10)
			/* other way
			this.iframe.onload = function () {
				iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
				if (iframeDoc) {
					iframeImage = iframeDoc.getElementById("image");
				}
				if (iframeImage) {
					iframeImage.error = function () {
						this.attempt += 2;
						this.loadQueue.push(index);
						setTimeout(this.doPreload.bind(this), fd.delay + Math.random() * fd.delay * this.attempt * 2 + Math.random() * fd.delay * this.attempt * 2);
					}.bind(this);
					iframeImage.onload = function () {
						this.finishPreload(index);
					}
				} else {
					this.finishPreload(index);
				}
			}.bind(this);
			this.iframe.onerror = function () {
				this.loadQueue.push(index);
				this.doPreload();
			}.bind(this);
			*/
			this.iframe.src = this.linkInfoArray[index].iframeSrc;
		} else {
			this.finishPreload(index);
		}
	},

/* No-iframe method
	doPreload: function () {
		var random,
			index,
			delay;
		this.showLoaded();
		if (this.loadingPaused || this.closed) {
			return;
		}
		random = Math.floor(Math.random() * Math.ceil(this.loadQueue.length / 4));
		index = this.loadQueue.splice(random, 1)[0];
		if (index === undefined) {
			return;
		}
		this.imagesArray[index] = new Image();
		this.imagesArray[index].onerror = function () {
			this.attempt += 2;
			this.loadQueue.push(index);
			setTimeout(function () {
				this.doPreload();
			}.bind(this), fd.delay + Math.random() * fd.delay * this.attempt * 2 + Math.random() * fd.delay * this.attempt * 2);
		}.bind(this);
		this.imagesArray[index].onload = function () {
			setTimeout(function () {
				this.attempt = Math.max(1, this.attempt - 1));
				this.doPreload();
			}.bind(this), fd.delay + Math.random() * fd.delay * this.attempt * 2 + Math.random() * fd.delay * this.attempt * 2);
		}.bind(this);
		this.imagesArray[index].src = this.linksArray[index];
	},
*/

	linkSetup: function () {
		var href,
			linkImg,
			thumbDiv,
			children,
			i,
			j;
		this.thumbnailsArray = [];
		this.dragListener = function (event) {this.dragThumbnail(event);}.bind(this);
		this.dropListener = function (event) {this.dropThumbnail(event);}.bind(this);
		this.thumbnailResizeListener = function (event) {this.thumbnailsResize(event);}.bind(this);
		this.thumbnailDropListener = function (event) {this.thumbnailsResizeDrop(event);}.bind(this);
		this.linksArray = [];
		this.linkInfoArray = [];
		this.imageInfoArray = [];
		this.imagesArray = [];
		for (i = 0; i < document.links.length; ++i) {
			href = document.links[i].href;
			if (href && this.fd.isImageURL(href)) {
				if (this.fd.doesntContain(this.linksArray, href)) {
					thumbDiv = document.createElement("DIV");
					thumbDiv.innerHTML = document.links[i].innerHTML;
					children = this.fd.traverseChildren(thumbDiv);
					for (j = 0; j < children.length; ++j) {
						this.fd.addEvent(children[j], "dragstart", function (event) {var evt = event || window.event;evt.stopPropagation();return false;});
						children[j].draggable = false;
					}
					this.fd.addEvent(thumbDiv, "mousedown", this.thumbnailGrab.bind(this));
					this.thumbnailBox.appendChild(thumbDiv);
					this.thumbnailsArray[this.thumbnailsArray.length] = thumbDiv;
					this.linksArray[this.linksArray.length] = href;
					this.linkInfoArray[this.linkInfoArray.length] = {
						onclick: getAttr(document.links[i], "onclick"),
						iframeSrc: getAttr(document.links[i], "data-original-image-url")
						};
					linkImg = document.links[i].getElementsByTagName("IMG");
					if (linkImg.length > 0) {
						this.imageInfoArray[this.imageInfoArray.length] = {
							alt: linkImg[0].getAttribute("alt")
							};
					} else {
						this.imageInfoArray[this.imageInfoArray.length] = {
							alt: ""
							};
					}
				}
			}
		}
		if (this.linksArray.length === 0) {
			alert('No suitable links could be found.');
			this.closeViewer();
		} else {
			this.loadQueue = [];
			for (i = 0; i < this.linksArray.length / 2; ++i) {
				this.loadQueue.push(i);
				if (i != this.linksArray.length - i - 1) {
					this.loadQueue.push(this.linksArray.length - i - 1);
				}
			}
			this.isLoading = true;
			this.doPreload();
			this.changeCurrent(0);
		}
	},

	showViewer: function () {
		this.displayBox.style.display = '';
		this.oldonclick = document.onclick;
		this.oldonkeydown = document.onkeydown;
		this.oldonkeyup = document.onkeyup;
		this.oldonmousemove = document.onmousemove;
		this.oldonresize = window.onresize;
		document.onclick = function (event) {this.limgonclick(event);}.bind(this);
		document.onkeydown = function (event) {this.limgonkeydown(event);}.bind(this);
		document.onkeyup = function (event) {this.limgonkeyup(event);}.bind(this);
		document.onmousemove = function (event) {this.limgmousemove(event);}.bind(this);
		window.onresize = this.showImage.bind(this);
		this.closed = false;
		this.linkSetup();
	},

	viewerSetup: function () {
		var body,
			limgstyle = document.createElement('STYLE');
		limgstyle.type = "text/css";
		limgstyle.innerHTML =
		"#limgThumbnailBox{z-index:20000;position:fixed;top:0;left:0;width:10%;height:100%;border-right:4px solid rgba(1,1,1,.3);color:#FFFFFF;text-align:center;overflow-y:auto;}" +
		"#limgThumbnailBox:before{}" +
		"#limgThumbnailBox img{border:none;}" +
		"#limgThumbnailBox *{font-family:Helvetica,Arial,Sans-Serif;}" +
		"#limbThumbnailBox.selected{background:rgba(0,0,0,.5);}" +
		"#limgThumbnailBox{-webkit-transition:opacity .5s ease;-moz-transition:opacity .5s ease;-o-transition:opacity .5s ease;transition: opacity .5s ease;}" +

		"#limgDisplayBox{z-index:20000;background:rgba(0,0,0,.5);position:fixed;top:0;left:0;width:100%;height:100%;color:#FFFFFF;text-align:center;padding-left:5%;}" +
		"#limgDisplayBox:before{content:'';display:inline-block;height:100%;vertical-align:middle;}" +
		"#limgDisplayBox a, #limgDisplayBox img{border:none;}" +
		"#limgDisplayBox *{font-family:Helvetica,Arial,Sans-Serif;}" +
		"#limgDisplayBox button,#limgNextButton,#limgPrevButton{background:transparent;display:inline-block;color:inherit;padding:2px 10px;border-width:2px;margin:0;border-color:white}" +
		"#limgDisplayBox button:hover,#limgPrevButton:hover,#limgNextButton:hover{border-color:rgb(204,204,204);border-width:2px;}" +

		"#limgImageBox{display:inline-block;vertical-align:middle;max-width:100%;max-height:100%;}" +
		"#limgImgLink:hover{cursor:url('http://www.htmlgoodies.com/images/black.gif'),auto;}" +
		"#limgImg{max-height:100%;max-width:100%;}" +

		"#limgCornerDiv,#limgSlideshowDiv,#limgPrev,#limgNext{z-index:10001;position:fixed;padding:0;margin:0;}" +
		"#limgCornerDiv{top:0;right:0;}" +
		"#limgProgress{display:inline-block;-webkit-border-bottom-left-radius:5px;-moz-border-bottom-left-radius:5px;border-bottom-left-radius:5px;border-style:none none solid solid;border-width:2px;border-color:white;padding:2px 10px;margin:0;}" +
		"#limgClose{border-top-style:none;border-right-style:none;}" +
		"#limgClose:hover{border-right-style:none;border-top-style:none;}" +

		"#limgSlideshowDiv{top:40px;right:0;-webkit-transition:right ease .3s;-moz-transition:right ease .3s;-o-transition:right ease .3s;transition:right ease .3s;}" +
		"#limgPlayingDiv{display:inline-block;}" +
		"#limgPlay,#limgReverse,#limgSlower,#limgFaster{border-right-style:none;}" +
		"#limgPlay:hover,#limgReverse:hover,#limgSlower:hover,#limgFaster:hover{border-right-style:none;}" +
		"#limgPlay{-webkit-border-top-left-radius:5px;border-top-left-radius:5px;-webkit-border-bottom-left-radius:5px;border-bottom-left-radius:5px;-moz-background-clip:padding;-webkit-background-clip:padding-box;background-clip:padding-box;}" +
		"#limgPlay:hover{}" +
		"#limgReverse{}" +
		"#limgReverse:hover{}" +
		"#limgFaster{}" +
		"#limgFaster:hover{}" +
		"#limgSlower{}" +
		"#limgSlower:hover{}" +

		"#limgNext:before,#limgPrev:before{content:'';display:inline-block;height:100%;vertical-align:middle;}" +
		"#limgNext,#limgPrev{background:rgba(0,0,0,.1);height:100%;z-index:9999;font-size:300%;}" +
		"#limgNext.show,#limgPrev.show{-webkit-transition:opacity 1s ease;-moz-transition:opacity 1s ease;-o-transition:opacity 1s ease;transition: opacity 1s ease;}" +
		"#limgNextButton,#limgPrevButton{-webkit-border-radius:20px;border-radius:20px;-moz-background-clip:padding;-webkit-background-clip:padding-box;background-clip:padding-box;border-style:solid;width:30px;height:30px;text-align:center;line-height:28px;padding:10px;}" +
		"#limgNext{top:0;right:0;padding:15px;}" +
		"#limgNext:hover{}" +
		"#limgNextButton{}" +
		"#limgNextButton:hover{}" +
		"#limgPrev{top:0;left:10%;padding:15px;}" +
		"#limgPrev:hover{}" +
		"#limgPrevButton{}" +
		"#limgPrevButton:hover{}" +

		"#limgIframe{display:none;}";

		if (document.getElementById('limgStyle')) {
			document.getElementsByTagName('HEAD')[0].removeChild(document.getElementById('limgStyle'));
		}
		limgstyle.id = 'limgStyle';
		document.getElementsByTagName('HEAD')[0].appendChild(limgstyle);

		// Opacity filter
		this.displayBox = document.createElement('DIV');
		this.displayBox.id = 'limgDisplayBox';
		body = document.getElementsByTagName('BODY')[0];
		body.insertBefore(this.displayBox, body.firstChild);

		// Thumbnail box
		this.thumbnailBox = document.createElement('DIV');
		this.thumbnailBox.id = 'limgThumbnailBox';
		this.fd.addEvent(this.thumbnailBox, "mousedown", this.thumbnailsResizeGrab.bind(this));
		this.displayBox.appendChild(this.thumbnailBox);

		// Image box for centering
		this.imageBox = document.createElement('DIV');
		this.imageBox.id = 'limgImageBox';
		this.displayBox.appendChild(this.imageBox);

		// Main image
		this.imageLink = document.createElement('A');
		this.imageLink.id = 'limgImgLink';
		this.imageLink.target = '_blank';
		this.imageLink.setAttribute("style", "cursor: url(http://www.htmlgoodies.com/images/1x1.gif), auto;");
		this.imageBox.appendChild(this.imageLink);
		this.image = document.createElement('IMG');
		this.image.id = 'limgImg';
		this.imageLink.appendChild(this.image);

		// Corner box
		this.cornerDiv = document.createElement('DIV');
		this.cornerDiv.id = 'limgCornerDiv';
		this.displayBox.appendChild(this.cornerDiv);

		// Progress indicator
		this.progress = document.createElement('DIV');
		this.progress.id = 'limgProgress';
		this.progress.onclick = this.pauseLoading.bind(this);;
		this.cornerDiv.appendChild(this.progress);

		// Close button
		this.closeButton = document.createElement('BUTTON');
		this.closeButton.id = "limgClose";
		this.closeButton.innerHTML = "X";
		this.closeButton.title = "Close (esc)";
		this.cornerDiv.appendChild(this.closeButton);

		// Slideshow box
		this.slideshowDiv = document.createElement('DIV');
		this.slideshowDiv.id = 'limgSlideshowDiv';
		this.displayBox.appendChild(this.slideshowDiv);

		// Play button
		this.playButton = document.createElement('BUTTON');
		this.playButton.id = "limgPlay";
		this.playButton.innerHTML = "&#x25b6;";
		this.playButton.title = "Play (p)";
		this.slideshowDiv.appendChild(this.playButton);

		// Playing box
		this.playingDiv = document.createElement('DIV');
		this.playingDiv.id = 'limgPlayingDiv';
		this.slideshowDiv.appendChild(this.playingDiv);

		// Reverse button
		this.reverseButton = document.createElement('BUTTON');
		this.reverseButton.id = "limgReverse";
		this.reverseButton.innerHTML = "&larr;";
		this.reverseButton.title = "Reverse (v)";
		this.playingDiv.appendChild(this.reverseButton);

		// Faster button
		this.fasterButton = document.createElement('BUTTON');
		this.fasterButton.id = "limgFaster";
		this.fasterButton.innerHTML = "+";
		this.fasterButton.title = "Faster (+)";
		this.playingDiv.appendChild(this.fasterButton);

		// Slower button
		this.slowerButton = document.createElement('BUTTON');
		this.slowerButton.id = "limgSlower";
		this.slowerButton.innerHTML = "-";
		this.slowerButton.title = "Slower (-)";
		this.playingDiv.appendChild(this.slowerButton);

		this.slideshowDiv.style.right = "-" + this.playingDiv.offsetWidth + "px";

		// Next region and button
		this.nextButtonRegion = document.createElement('DIV');
		this.nextButtonRegion.id = "limgNext";
		this.displayBox.appendChild(this.nextButtonRegion);
		this.nextButton = document.createElement('DIV');
		this.nextButton.id = "limgNextButton";
		this.nextButton.innerHTML = "&#x25b6;";
		this.nextButtonRegion.appendChild(this.nextButton);

		// Previous region and button
		this.previousButtonRegion = document.createElement('DIV');
		this.previousButtonRegion.id = "limgPrev";
		this.displayBox.appendChild(this.previousButtonRegion);
		this.previousButton = document.createElement('DIV');
		this.previousButton.id = "limgPrevButton";
		this.previousButton.innerHTML = "&#x25c0;";
		this.previousButtonRegion.appendChild(this.previousButton);

		// Iframe for tricky fetching
		this.iframe = document.createElement('IFRAME');
		this.iframe.id = "limgIframe";
		this.displayBox.appendChild(this.iframe);

		this.fd.addEvent(this.displayBox, 'mouseover', function () {this.mouseInside = true;}.bind(this));
		this.fd.addEvent(this.displayBox, 'mouseout', 
			this.fd.makeMouseOutFn(this.displayBox, function (event) {this.mouseInside = false;if (!this.mouseInImg) {this.limgmousemove(event);}}.bind(this)));

		this.fd.addEvent(this.image, 'mouseover', function () {this.mouseInImg = true;}.bind(this));
		this.fd.addEvent(this.image, 'mouseout', function () {this.mouseInImg = false;}.bind(this));

		fd.delay  = fd.delay === undefined ? 150 : 250 + fd.delay;
		this.limgmousemove(null);
		this.showViewer();
	},

	clear: function () {
		this.destroy();
	},

	destroy: function () {
		var i,
			member,
			functionNames = Object.getOwnPropertyNames(Imager.prototype);
		this.closeViewer();
		for (i = 0; i < functionNames.length; ++i) {
			delete Imager.prototype[functionNames[i]];
		}
		for (member in this) {
			if (!this.hasOwnProperty(member)) {
				continue;
			}
			if (this[member] instanceof HTMLElement) {
				this[member].innerHTML = "";
				if (this[member].parentNode) {
					this[member].parentNode.removeChild(this[member]);
				}
			} else if (this[member] instanceof Function) {
				this[member] = function () {};
			} else {
			}
			delete this[member];
		}
		delete window.Imager;
		delete window.FinalDoom.Imager;
	},

	showVars: function() {
		var member,
			functionNames = Object.getOwnPropertyNames(Imager.prototype);
		for (i = 0; i < functionNames.length; ++i) {
			console.log(functionNames[i], typeof Imager.prototype[functionNames[i]]);
		}
		for (member in this) {
			if (!this.hasOwnProperty(member)) {
				continue;
			}
			console.log(member, typeof this[member], this[member]);
		}
	}
	
};

}(window));
