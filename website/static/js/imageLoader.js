function ImageLoader(generatorURL, startIndex, minIndex, maxIndex, limit, callback) {
	"use strict";

	if (typeof generatorURL !== 'string') {
		throw ("generatorURL must be defined and be a string");
	}
	if (startIndex !== undefined && typeof startIndex !== 'number') {
		throw ("startIndex must be a number if defined");
	}
	if (minIndex !== undefined && typeof minIndex !== 'number') {
		throw ("minIndex must be a number if defined");
	}
	if (maxIndex !== undefined && typeof maxIndex !== 'number') {
		throw ("maxIndex must be a number if defined");
	}
	if (limit !== undefined && typeof limit !== 'number') {
		throw ("limit must be a number if defined");
	}
	if (minIndex !== undefined && maxIndex !== undefined && minIndex > maxIndex) {
		throw ("minIndex must be less than maxIndex");
	}
	if (startIndex !== undefined) {
		if (minIndex !== undefined && startIndex < minIndex) {
			startIndex = minIndex;
		}
		if (maxIndex !== undefined && startIndex > maxIndex) {
			startIndex = maxIndex;
		}
	}

	var imageList = {},
		urlList = {},
		generator = generatorURL,
		min = minIndex,
		max = maxIndex,
		start = startIndex === undefined ? 0 : startIndex,
		prefetchLimit = (limit === undefined ? 20 : limit),
		callbackfunc = callback !== undefined ? callback : function () {},
		before = 0,
		after = 0,
		first = start,
		last = start,
		curIndex = start,
		stop = 0,
		waits = [],
		error = "http:///";

	function doWait() {
		var tmp = waits;
		waits = [];
		while (tmp.length !== 0) {
			tmp.shift()();
		}
	}

	function addWait(func) {
		waits.push(func);
	}

	function setError(index) {
		if (index === curIndex) {
			addWait(function () {
				setError(index);
			});
			return;
		}
		try {
			imageList[index] = error;
			urlList[index] = error;
			if (index > curIndex) {
				after -= 1;
			} else if (index < curIndex) {
				before -= 1;
			}
		} catch (exception) {
		}
	}

	function remove(index) {
		if (index === curIndex) {
			addWait(function () {
				remove(index);
			});
			return;
		}
		if (index > curIndex) {
			if (index === last) {
				last -= 1;
			}
			if (imageList[index] !== error) {
				after -= 1;
			}
		} else if (index < curIndex) {
			if (index === first) {
				first += 1;
			}
			if (imageList[index] !== error) {
				before -= 1;
			}
		}
		delete imageList[index];
		doWait();
	}

	function cleanup() {
		var rem = first;
		while (before > prefetchLimit) {
			remove(rem);
			rem += 1;
		}
		rem = last;
		while (after > prefetchLimit) {
			remove(rem);
			rem -= 1;
		}
	}

	function next() {
		var nextNode, looking = curIndex + 1;
		do {
			nextNode = imageList[looking];
			if (nextNode === error) {
				looking += 1;
			} else {
				curIndex = looking;
				if (imageList[looking - 1] !== error && imageList[looking - 1] !== undefined) {
					before += 1;
				}
				if (nextNode === undefined) {
					return null;
				}
				after -= 1;
				callbackfunc();
				doWait();
				cleanup();
				return nextNode;
			}
		} while (true);
	}

	function nextURL() {
		var nextNode = next();
		if (nextNode !== undefined && nextNode !== null) {
			return nextNode.src;
		} else {
			return null;
		}
	}

	function previous() {
		var previousNode, looking = curIndex - 1;
		do {
			previousNode = imageList[looking];
			if (previousNode === error) {
				looking -= 1;
			} else {
				curIndex = looking;
				if (imageList[looking + 1] !== error && imageList[looking + 1] !== undefined) {
					after += 1;
				}
				if (previousNode === undefined) {
					return null;
				}
				before -= 1;
				callbackfunc();
				doWait();
				cleanup();
				return previousNode;
			}
		} while (true);
	}

	function previousURL() {
		var previousNode = previous();
		if (previousNode !== null) {
			return previousNode.src;
		} else {
			return null;
		}
	}

	function current() {
		return imageList[curIndex] !== undefined ? imageList[curIndex] : null;
	}

	function currentURL() {
		var currentNode = current();
		if (currentNode === error) {
			return currentNode;
		}
		if (currentNode !== null) {
			return currentNode.src;
		} else {
			return null;
		}
	}

	function currentIndex() {
		return curIndex;
	}

	function doLoadSuccess(increment, index, data) {
		var image = new Image();
		image.onload = function () {
			doLoad(increment, index + increment);
		};
		image.onerror = function () {
			setError(index);
			doLoad(increment, index + increment);
		};
		image.src = data;
		if (index > last) {
			last = index;
		} else if (index < first) {
			first = index;
		}
		imageList[index] = image;
		urlList[index] = data;
		if (index > curIndex) {
			after += 1;
		} else if (index < curIndex) {
			before += 1;
		} else {
			callbackfunc();
		}
	}

	function doLoad(increment, index) {
		if (stop > 0) {
			stop -= 1;
			doWait();
			return;
		}
		if (index === null) {
			throw ("index must not be null");
		}
		if (increment === 0) {
			throw ("increment must not be 0");
		}
		if (increment < 0 && index < first - 1) {
			index = first - 1;
		} else if (increment > 0 && index > last + 1) {
			index = last + 1;
		}
		if ((max !== undefined && index > max) ||
				(min !== undefined && index < min)) {
			return;
		}
		if ((increment < 0 && before >= prefetchLimit) ||
				(increment > 0 && after >= prefetchLimit)) {
			addWait(function () { doLoad(increment, index); });
			return;
		}
		if (urlList[index] === undefined) {
			$.ajax({
				url: generator + index + '/',
				success: function (data) {
					doLoadSuccess(increment, index, data);
				}
			});
		} else if (imageList[index] !== undefined) {
			doLoad(increment, index + increment);
		} else {
			doLoadSuccess(increment, index, urlList[index]);
		}
	}

	function dofirstSuccess(index, data) {
		var image = new Image();
		image.onload = function () {
			doLoad(-1, index - 1);
			doLoad(1, index + 1);
		};
		image.onerror = function () {
			doLoad(-1, index - 1);
			doLoad(1, index + 1);
			setError(index);
		};
		image.src = data;
		imageList[index] = image;
		urlList[index] = data;
		callbackfunc();
	}

	function dofirst(index) {
		if ((max !== undefined && index > max) ||
				(min !== undefined && index < min)) {
			return;
		}
		if ((before > prefetchLimit) ||
				(after > prefetchLimit)) {
			addWait(function () { dofirst(index); });
			return;
		}
		if (urlList[index] === undefined) {
			$.ajax({
				url: generator + index + '/',
				success: function (data) {
					dofirstSuccess(index, data);
				}
			});
		} else if (imageList[index] !== undefined) {
			doLoad(-1, index - 1);
			doLoad(1, index + 1);
			callbackfunc();
		} else {
			dofirstSuccess(index, urlList[index]);
		}
	}

	function finishGoTo(oldIndex) {
		if (stop > 0) {
			addWait(function () {
				finishGoTo(oldIndex);
			});
			return;
		}
		stop = 0;
		waits = [];
		// Fix up the actual values of before and after
		if (before !== 0 && after !== 0) {
			var between = 0, ti = curIndex > oldIndex ? oldIndex + 1 : oldIndex - 1;
			while (ti !== curIndex) {
				if (imageList[ti] !== error) {
					between += 1;
				}
				ti += curIndex > oldIndex ? 1 : -1;
			}
			if (curIndex > oldIndex) {
				before += between + (imageList[oldIndex] !== error ? 1 : 0);
				after -= between + (imageList[curIndex] !== error ? 1 : 0);
			} else {
				before -= between + (imageList[curIndex] !== error ? 1 : 0);
				after += between + (imageList[oldIndex] !== error ? 1 : 0);
			}
		}
		dofirst(curIndex);
		cleanup();
	}

	function goTo(index) {
		var diff = index > curIndex ? index - curIndex : curIndex - index, oldIndex;
		stop = 2;
		if (diff > prefetchLimit) {
			for (diff in imageList) {
				if (imageList.hasOwnProperty(diff)) {
					delete imageList[diff];
				}
			}
			first = index;
			last = index;
			before = 0;
			after = 0;
		}
		doWait();
		stop -= waits.length;
		waits = [];
		oldIndex = curIndex;
		curIndex = index;
		finishGoTo(oldIndex);
	}

	dofirst(curIndex);

	this.goTo = goTo;
	this.next = next;
	this.nextURL = nextURL;
	this.previous = previous;
	this.previousURL = previousURL;
	this.current = current;
	this.currentURL = currentURL;
	this.currentIndex = currentIndex;
}
