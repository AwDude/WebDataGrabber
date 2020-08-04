const Script = require("modules/script");
const Dialog = require("modules/dialog")();
					
module.exports = function(Browser, stepList) {
	
	var currentScript = null;
	var clickedElement = null;
	var preventClick = false;
	var doRecord = false;
	var lastHoverElement;
	var lastHoverElementBorder;
	
	function init() {
		Browser.onLoad(onLoaded);
	}
	
	function onLoaded() {
		if (doRecord) {
			Browser.document.addEventListener("click", onClick, true);
		}
		Browser.window.addEventListener('beforeunload', function() {
			if (doRecord) {
				Dialog.showLoadingDialog();
			}
		}, true);
		Dialog.hideDialog();
	}
	
	function emulateClick(element) {
		if (element !== null) {
			const event = new Event('click', {"bubbles": true, "cancelable": false});
			element.dispatchEvent(event);
		}
	}
	
	function onClick(event) {
		if (preventClick) {
			event.preventDefault();
			event.stopPropagation();
		}
		// ensure event originates from user click
		if (!event.isTrusted) { 
			return;
		}
		// !!! use last step Element xpath instead of clicked element
		const isNewRoot = !Browser.document.body.contains(clickedElement);
		clickedElement = event.target;
		const rect = Browser.boundingRect;
		const mouseX = event.clientX + rect.left;
		const mouseY = event.clientY + rect.top;
		const options = ["Click", "Extract Text", "Repeat Next Steps", "Cancel"];
		const message = "Select Action";
		Dialog.showSelectDialog(message, options, onActionSelected, mouseX, mouseY);
	}
	
	function onActionSelected(action) {
		if (action === "Cancel") {
			clickedElement = null;
			return;
		}
		if (action === "Click") {
			preventClick = false;
			Browser.preventNavigation = false;
			emulateClick(clickedElement);
		}
		//currentScript.addStep(clickedElement, action);
		preventClick = true;
		Browser.preventNavigation = true;
	}
	
	function onHover(event) {
		if (lastHoverElement !== undefined) {
			lastHoverElement.style.border = lastHoverElementBorder;
		}
		lastHoverElement = event.target;
		lastHoverElementBorder = lastHoverElement.style.border;
		lastHoverElement.style.border = "2px solid red";
	}
	
	function isRecording() {
		return doRecord;
	}
	
	function start() {
		doRecord = true;
		preventClick = true;
		Browser.preventNavigation = true;
		//currentScript = Script.create(iFrame, stepList);
		stepList.innerHTML = "";
		if (Browser.document !== undefined) {
			Browser.document.addEventListener("click", onClick, true);
			Browser.document.body.addEventListener("mouseover", onHover);
		}
	}
	
	function stop() {
		doRecord = false;
		preventClick = false;
		Browser.preventNavigation = false;
		if (Browser.document !== undefined) {
			Browser.document.removeEventListener("click", onClick, true);
			Browser.document.body.removeEventListener("mouseover", onHover);
			if (lastHoverElement !== undefined) {
				lastHoverElement.style.border = lastHoverElementBorder;
			}
		}
	}
	
	function save() {
		//nw.__dirname
	}
	
	init();
	return {
		isRecording: isRecording,
		start: start,
		stop: stop,
		save: save
	};
}