var dialogOverlay;
var urlInput;
var stepList;
var webFrame;
var webDoc;
var recordBtn;
var steps = [];
var currentStep;
var doRecord = false;
var preventClicks = false;

const stepHtml = "	<h4 class='step-number'></h4> \
					<div class='step-info'> \
						<span class='step-action-node'>listenelement</span> \
						<span class='step-url'>link</span> \
					</div>";

docReady(function() {
	const win =	nw.Window.get();
	win.showDevTools();
	win.on('new-win-policy', function(frame, url, policy) {
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
	
	dialogOverlay = document.getElementById("overlay");
	urlInput = document.getElementById("url");
	stepList = document.getElementById("steps");
	webFrame = document.getElementById("website");
	recordBtn = document.getElementById("record-btn");
	
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

function run() {
	if (steps.length == 0) {
		return;
	}
	webFrame.src = steps[0].url;
	steps.forEach(function(entry) {
		console.log(entry);
	});
}

function appendStep() {
	const step = document.createElement('li');
	step.className = "step";
	step.innerHTML = stepHtml;
	const stepNumber = step.getElementsByClassName("step-number")[0];
	const stepActionNode = step.getElementsByClassName("step-action-node")[0];
	const stepUrl = step.getElementsByClassName("step-url")[0];
	stepNumber.innerHTML = steps.length;
	stepActionNode.textContent = currentStep.action + " " + currentStep.tag;
	stepUrl.textContent = currentStep.url;
	stepList.appendChild(step);
}

function saveStep() {
	currentStep.action = document.querySelector('input[name="action"]:checked').value;
	steps.push(currentStep);
	appendStep();
	
	if (currentStep.action === 'click') {
		preventClicks = false;
		getElement(currentStep.xpath).click();
		// PREVENT CLICKS WHEN IFRAME LOADED AND HIDE DIALOG AFTERWARDS!
		dismissDialog();
	} else {
		dismissDialog();
	}
}

function dismissDialog() {
	currentStep = null;
	dialogOverlay.style.display = "none";
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
	if (doRecord) {
		doRecord = false;
		preventClicks = false;
		// SAVE DIALOG
		recordBtn.textContent = "Record Steps";
	} else {
		doRecord = true;
		preventClicks = true;
		stepList.innerHTML = "";
		steps = [];
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
	if (typeof(webFrame) !== 'undefined') { //'contentDocument' in webFrame || 'contentWindow' in webFrame) {
		webDoc = webFrame.contentDocument || webFrame.contentWindow.document;
		webDoc.addEventListener("click", onElementClicked, true);
		urlInput.value = webFrame.contentWindow.location.href;
    }
}

function onElementClicked(event) {
	if (preventClicks) {
		event.preventDefault();
		event.stopPropagation();
	}
	if (!event.isTrusted /*ensure event originates from user click*/ || !doRecord) { 
		return;
	}
	currentStep = {
		url: webFrame.contentWindow.location.href,
		tag: event.target.tagName,
		xpath: getXPath(event.target)
	};
	dialogOverlay.style.display = 'block';
}

function getElement(xpath) {
  return webDoc.evaluate(xpath, webDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function getXPath(element) {
    if (element.id!=='')
        return 'id("'+element.id+'")';
    if (element===document.body)
        return element.tagName;

    var ix= 0;
    var siblings= element.parentNode.childNodes;
    for (var i= 0; i<siblings.length; i++) {
        var sibling= siblings[i];
        if (sibling===element)
            return getXPath(element.parentNode)+'/'+element.tagName+'['+(ix+1)+']';
        if (sibling.nodeType===1 && sibling.tagName===element.tagName)
            ix++;
    }
}

function docReady(func) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(func, 1); // call on next available tick
    } else {
        document.addEventListener("DOMContentLoaded", func);
    }
}    