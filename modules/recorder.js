const maxRunAttempts = 120;
const runStepDelay = 500;
const repeatIndent = 20;
const Script = require("modules/script");
const Dialog = require("modules/dialog")();
const stepHtml = "	<div class='step'> \
						<h3 class='step-number'></h3> \
						<div class='step-info'> \
							<span class='step-action'></span> \
							<a class='step-url'></span> \
						</div> \
					</div>";
					
module.exports = function(iFrame, stepList) {
	
	var currentScript = null;
	var clickedElement = null;
	var preventPropagation = false;
	var doRecord = false;
	var doRun = false;		
	var lastHoverElement;
	var lastHoverElementBorder;
	
	function init() {
		if (iFrame.doc !== undefined && iFrame.doc.readyState !== "loading") {
			iFrame.contentWindow.addEventListener('beforeunload', Dialog.showLoadingDialog, true);
		}
		iFrame.addEventListener('load', onLoaded, true);
	}
	
	function onLoaded() {
		if (doRecord) {
			iFrame.doc.addEventListener("click", onClick, true);
		}
		iFrame.contentWindow.addEventListener('beforeunload', Dialog.showLoadingDialog, true);
		Dialog.hideDialog();
		if (doRun) {
			Dialog.showInfoDialog("Executing Script...");
			preventPropagation = false;
			doRun = false;
			currentScript.run(onRunFinished);
		}
	}
	
	function onClick(event) {
		if (preventPropagation) {
			event.preventDefault();
			event.stopPropagation();
		}
		// ensure event originates from user click
		if (!event.isTrusted) { 
			return;
		}
		clickedElement = event.target;
		const rect = iFrame.getBoundingClientRect();
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
			preventPropagation = false;
		}
		currentScript.addStep(clickedElement, action);
		preventPropagation = true;
	}
	
	function onHover(event) {
		if (lastHoverElement !== undefined) {
			lastHoverElement.style.border = lastHoverElementBorder;
		}
		lastHoverElement = event.target;
		lastHoverElementBorder = lastHoverElement.style.border;
		lastHoverElement.style.border = "2px solid red";
	}

	function onRunFinished() {
		if (doRecord) {
			preventPropagation = true;
		}
		Dialog.hideDialog();
	}
	
	function isRecording() {
		return doRecord;
	}
	
	function start() {
		doRecord = true;
		preventPropagation = true;
		currentScript = Script.create(iFrame, stepList);
		stepList.innerHTML = "";
		if (iFrame.doc !== undefined) {
			iFrame.doc.addEventListener("click", onClick, true);
			iFrame.doc.body.addEventListener("mouseover", onHover);
		}
	}
	
	function stop() {
		doRecord = false;
		preventPropagation = false;
		if (iFrame.doc !== undefined) {
			iFrame.doc.removeEventListener("click", onClick, true);
			iFrame.doc.body.removeEventListener("mouseover", onHover);
			if (lastHoverElement !== undefined) {
				lastHoverElement.style.border = lastHoverElementBorder;
			}
		}
	}
	
	function save() {
		//nw.__dirname
	}
	
	function run() {
		if (currentScript !== null) {
			doRun = true;
			iFrame.src = currentScript.getStartUrl();
		}
	}
	
	init();
	return {
		isRecording: isRecording,
		start: start,
		stop: stop,
		save: save,
		run: run
	};
}