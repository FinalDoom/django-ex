// JavaScript Document

var box, list, tab, tabtext, colorSheet, tabMin, tabMax, oldColor = "Default", shown = false;

function initColorBox() {
	box = document.getElementById('colorbox');
	list = document.getElementById('colorlist');
	tab = document.getElementById('colortab');
	tabtext = document.getElementById('colortabtext');
	colorSheet = document.getElementById('colorSheet');
	box.style.display = "block";
	box.style.left = (-1 * list.offsetWidth) + "px";
	tab.onclick = toggleCB;
	
	// Setup the color changing links in colorlist
	colorLinks = list.firstElementChild.getElementsByTagName( "a" );
	for ( i in colorLinks ) {
		colorLinks[i].onclick = function() {
			setScheme( colorLinks[i].text );
		};
	}
	
	// Set the color from cookies
	setScheme( get_cookie( "Color" ) );
}

function toggleCB() {
	if (shown) {
		doPosChangeMem(box,[0,0],[-1*list.offsetWidth,0],10,25,.5);
			doChangeTextMem(tabtext,['<'],
			['C','h','a','n','g','e','&nbsp;','C','o','l','o','r','s'],25);
		
		if ( tabtext.style.color ) {
			tabtext.style.color = "inherit";
		}
		else {
			tabtext.fgColor = "inherit";
		}
		window.setTimeout( function() {
			doFGFadeMem( tabtext, [0, 10, 34], [70, 95, 154], 10, 25, .5);
		}, 200);
		doWidthChangeMem(tab,tabMin,tabMax,10,25,.5);
		shown = false;
	}
	else {
		doPosChangeMem(box,[-1*list.offsetWidth,0],[0,0],10,25,.5);
		if (tabMax === undefined) {
			tabMax = tab.offsetWidth;
		}
		if (tabMin === undefined) {
			text = tabtext.innerHTML;
			tabtext.innerHTML = "<";
			tabMax = tab.offsetWidth;
			tabtext.innerHTML = text;
		}
		doChangeTextMem(tabtext,
			['C','h','a','n','g','e','&nbsp;','C','o','l','o','r','s'],
			['<'], 20
		);
		if ( tabtext.style.color ) {
			tabtext.style.color = "inherit";
		}
		else {
			tabtext.fgColor = "inherit";
		}
		window.setTimeout( function() {
			doFGFadeMem(tabtext, [0, 10, 34], [70, 95, 154], 15, 25, .5)
		}, 200);
		doWidthChangeMem(tab,tabMax,tabMin,10,25,.5);
		shown = true;
	}
}

function toggleVisibility(elem) {
	if ( elem.style.visibility == "hidden" ) {
		elem.style.visibility = "visible";
	}
	else {
		elem.style.visibility = "hidden";
	}
}

function doChangeTextMem(elem,startText,endText,interval) {
	var increaseLength = true;
	var letter = 0;
	if (startText.length > endText.length) {
		increaseLength = false;
		letter = startText.length;
	}
	elem.textInt = window.setInterval( function() {
		if (increaseLength) {
			startText[letter] = endText[letter];
			letter++;
			elem.innerHTML = startText.join('');
			if (letter >= endText.length) {
				window.clearInterval(elem.textInt);
			}
		}
		else {
			if (letter < endText.length) {
				startText[letter] = endText[letter];
			}
			else {
				startText[letter] = '';
			}
			letter--;
			elem.innerHTML = startText.join('');
			if (letter < 0) {
				window.clearInterval(elem.textInt);
			}
		}
	}, interval);
}

function doFGFadeMem(elem,startRGB,endRGB,steps,intervals,powr) {
	//modified BG Fader with Memory by www.hesido.com
	if (elem.fgFadeMemInt) window.clearInterval(elem.fgFadeMemInt);
	var actStep = 0;
	elem.fgFadeMemInt = window.setInterval( function() {
		elem.currentfgRGB = [
			easeInOut(startRGB[0],endRGB[0],steps,actStep,powr),
			easeInOut(startRGB[1],endRGB[1],steps,actStep,powr),
			easeInOut(startRGB[2],endRGB[2],steps,actStep,powr)
		];
		if ( tabtext.style.color ) {
			elem.style.color = "rgb("+
				elem.currentfgRGB[0]+","+
				elem.currentfgRGB[1]+","+
				elem.currentfgRGB[2]+
			")";
		}
		else {
			elem.fgColor = "rgb("+
				elem.currentfgRGB[0]+","+
				elem.currentfgRGB[1]+","+
				elem.currentfgRGB[2]+
			")";
			actStep++;
			if (actStep > steps) window.clearInterval(elem.fgFadeMemInt);
		}
	} ,intervals );
}

function doWidthChangeMem(elem,startWidth,endWidth,steps,intervals,powr) {
	//Width changer with Memory by www.hesido.com
	if (elem.widthChangeMemInt) window.clearInterval(elem.widthChangeMemInt);
	var actStep = 0;
	elem.widthChangeMemInt = window.setInterval( function() {
		elem.currentWidth = easeInOut(startWidth,endWidth,steps,actStep,powr);
		actStep++;
		if (actStep > steps) window.clearInterval(elem.widthChangeMemInt);
	},intervals);
}

function doPosChangeMem(elem,startPos,endPos,steps,intervals,powr) {
	//Position changer with Memory by www.hesido.com
	if (elem.posChangeMemInt) window.clearInterval(elem.posChangeMemInt);
	var actStep = 0;
	elem.posChangeMemInt = window.setInterval( function() {
		elem.currentPos = [
			easeInOut(startPos[0],endPos[0],steps,actStep,powr),
			easeInOut(startPos[1],endPos[1],steps,actStep,powr)
		];
		elem.style.left = elem.currentPos[0]+"px";
		elem.style.top = elem.currentPos[1]+"px";
		actStep++;
		if (actStep > steps) window.clearInterval(elem.posChangeMemInt);
	},intervals );
}

function easeInOut(minValue,maxValue,totalSteps,actualStep,powr) {
	//Generic Animation Step Value Generator By www.hesido.com
	var delta = maxValue - minValue;
	var stepp = minValue+(Math.pow(((1 / totalSteps)*actualStep),powr)*delta);
	return Math.ceil(stepp)
}

function setScheme(color) {
	if ( color == null || color == "null" ) {
		color = "Default";
	}
	colorSheet.href = colorSheet.href.replace(oldColor,color);
	oldColor = color;
	var expire = new Date( ( new Date() ).getTime() + 1000 * 60 * 60 * 24 * 365 * 10 );
	document.cookie = "Color=" + escape( color ) + ";expires=" + expire.toGMTString() + ";path=/~nmoseley";
}
