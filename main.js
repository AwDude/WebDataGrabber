const locationObserver = new MutationObserver(onLocationChange);
var urlInput;
var stepList;
var webFrame;
var recordBtn;
var recorder;

docReady(function() {
	const win =	nw.Window.get();
	win.showDevTools();
	win.on('new-win-policy', function(frame, url, policy) {
		policy.ignore();
		webFrame.src = url;
	});
	win.on('navigation', function(frame, url, policy) {
		policy.ignore();
		webFrame.src = url;
	});
	win.on('close', function () {
		this.hide();
		if (isHttp(urlInput.value)) {
			localStorage.lastUrl = urlInput.value;
		}
		this.close(true);
	});
	// enable context object usage in modules
	global.console = console;
	global.doc = document;
	
	urlInput = document.getElementById("url");
	stepList = document.getElementById("steps");
	webFrame = document.getElementById("website");
	recordBtn = document.getElementById("record-btn");
	recorder = require("modules/recorder")(webFrame, stepList);
	
	if (isHttp(localStorage.lastUrl)) {
		webFrame.src = localStorage.lastUrl;
	}
	
	initDrag();
});

function initDrag() {
	const container = document.getElementById("container");
	const grabber = document.getElementById("grabber");
	const dragBar = document.getElementById("dragbar");
	var doDrag = false;
	
	document.addEventListener('mousedown', function(event) {
		webFrame.style.pointerEvents = "none";
		webFrame.style.userSelect = "none";
		document.body.style.userSelect = "none";
		if (event.target === dragBar) {
			doDrag = true;
		}
	});
	document.addEventListener('mousemove', function(event) {
		if (!doDrag) {
			return false;
		}
		const pointerRelativeXpos = event.clientX - container.offsetLeft;
		const grabberMinWidth = 128; // Min width, otherwise grabber content will collapse to width of 0
		grabber.style.width = (Math.max(grabberMinWidth, pointerRelativeXpos - 8)) + 'px';
		grabber.style.flexGrow = 0;
	});
	document.addEventListener('mouseup', function(event) {
		webFrame.style.pointerEvents = "auto";
		webFrame.style.userSelect = "auto";
		document.body.style.userSelect = "auto";
		doDrag = false;
	});
}

function isHttp(url) {
	return /^https?:\/\//i.test(url);
}

function loadWebsite() {
	var url = urlInput.value;
	if (!isHttp(url)) {
		url = 'https://' + url;
	}
	webFrame.src = url;
}

function toggleRecord() {
	if (recorder.isRecording()) {
		recorder.stop();
		recordBtn.textContent = "Record Steps";
	} else {
		recorder.start();
		recordBtn.textContent = "Stop Recording";
	}
}

function onUrlEntered(event) {
	if (event.which == 13) {
		loadWebsite();
        return false;
    }
}

function onWebsiteLoaded() {
	if (webFrame !== undefined) {
		urlInput.value = webFrame.contentWindow.location.href;
		const config = {
			childList: true,
			subtree: true
		}
		const webDoc = webFrame.contentDocument || webFrame.contentWindow.document;
		locationObserver.disconnect();
		locationObserver.observe(webDoc, config);
    }
}

function onLocationChange() {
	urlInput.value = webFrame.contentWindow.location.href;
}

function docReady(func) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(func, 1); // call on next available tick
    } else {
        document.addEventListener("DOMContentLoaded", func);
    }
}    