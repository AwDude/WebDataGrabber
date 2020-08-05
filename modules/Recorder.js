const Script = require("modules/Script");
const Dialog = require("modules/Dialog")();
					
module.exports = function(Browser, stepList) {
	
	var currentScript = null;
	var clickedElement = null;
	var preventClickPropagation = false;
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
		if (preventClickPropagation) {
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
		showSelectActionDialog(event, Browser.boundingRect);
	}
	
	function showSelectActionDialog(event, rect) {
		const mouseX = event.clientX + rect.left;
		const mouseY = event.clientY + rect.top;
		const options = ["Click", "Extract text", "Repeat next steps", "Wait until gone", "Fill in", "Cancel"];
		const message = "Select Action";
		Dialog.showSelectDialog(message, options, onActionSelected, mouseX, mouseY);
	}
	
	function onActionSelected(action) {
		switch (action) {
			case "Click":
				preventClick(false);
				emulateClick(clickedElement);
				preventClick(true);
				break;
			case "Extract text":
				break;
			case "Repeat next steps":
				break;
			case "Cancel":
				clickedElement = null;
				return;
		}
		//currentScript.addStep(clickedElement, action);
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
	
	function preventClick(doPrevent) {
		preventClickPropagation = doPrevent;
		Browser.preventNavigation = doPrevent;
	}
	
	function start() {
		doRecord = true;
		preventClick(true);
		currentScript = Script.create(Browser.url);
		stepList.innerHTML = "";
		if (Browser.document !== undefined) {
			Browser.document.addEventListener("click", onClick, true);
			Browser.document.body.addEventListener("mouseover", onHover);
		}
	}
	
	function stop() {
		doRecord = false;
		preventClick(false);
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