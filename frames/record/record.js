const locationObserver = new MutationObserver(onDomChange);
//var recorder;

function initWindow() {
	const win =	nw.Window.get();
	win.showDevTools();
	const onNavigate = function(frame, url, policy) {
		policy.ignore();
		iframe.src = url;
	};
	win.on('new-win-policy', onNavigate);
	win.on('navigation', onNavigate);
	win.on('close', function () {
		this.hide();
		if (isHttp(url_input.value)) {
			localStorage.lastUrl = url_input.value;
		}
		this.close(true);
	});
}

function onDocReady() {
	// enable context object usage in modules
	global.console = console;
	global.doc = document;
	
	Object.defineProperty(iframe, "doc", {
		get: function() { return this.contentDocument || this.contentWindow.document; }
	});
	
	require("modules/Dragbar")(script_container, 8, dragbar, iframe);
	//recorder = require("modules/recorder")(iframe, step_list);
	
	if (isHttp(localStorage.lastUrl)) {
		iframe.src = localStorage.lastUrl;
	}
}

function toggleRecord() {
/*	if (recorder.isRecording()) {
		recorder.stop();
		record_btn.textContent = "Record Steps";
	} else {
		recorder.start();
		record_btn.textContent = "Stop Recording";
	}
*/
}

function isHttp(url) {
	return /^https?:\/\//i.test(url);
}

function loadWebsite() {
	var url = url_input.value;
	if (!isHttp(url)) {
		url = 'https://' + url;
	}
	iframe.src = url;
}

function onUrlEntered(event) {
	if (event.which == 13) {
		loadWebsite();
        return false;
    }
}

function onWebsiteLoaded() {
	if (iframe !== undefined && iframe.doc !== undefined) {
		url_input.value = iframe.contentWindow.location.href;
		const config = {
			childList: true,
			subtree: true
		}
		locationObserver.disconnect();
		locationObserver.observe(iframe.doc, config);
		onFinishedLoading(iframe.contentWindow, function() { console.log("finished"); });
    }
}

function onFinishedLoading(win, callback) {
	iframe.doc.body.addEventListener('load', function() { console.log("DOC LOAD"); }, true);
	
	const nativeSend = win.XMLHttpRequest.prototype.send;
	var count = 0;
	const onLoaded = function() {
		count--;
		console.log("Received", count);
		if (count <= 0) {
			callback();
		}
	}
	win.XMLHttpRequest.prototype.send = function(body) {
		if (this.readyState === XMLHttpRequest.OPENED) {
			count++;
			console.log("Sent", count);
			this.addEventListener('loadend', onLoaded);
			this.addEventListener('abort', function() { console.log("Abort", count); });
			this.addEventListener('error', function() { console.log("Error", count); });
		}
		return nativeSend.apply(this, arguments);
	}
}

function onDomChange(mut) {
	console.log("DOM CHANGE", mut);
	url_input.value = iframe.contentWindow.location.href;
}

initWindow();

(function docReady(onReady) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(onReady, 1); // call on next available tick
    } else {
        document.addEventListener("DOMContentLoaded", onReady);
    }
})(onDocReady);