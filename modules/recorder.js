const dialog = require("modules/dialog")();
const stepHtml = "	<div class='step'> \
						<h3 class='step-number'></h3> \
						<div class='step-info'> \
							<span class='step-action'></span> \
							<a class='step-url'></span> \
						</div> \
					</div>";
					
module.exports = function(iFrame, stepList) {
	var iFrameDoc;
	var steps = [];
	var currentStep;
	var preventPropagation = false;
	var doRecord = false;
	var xpath;
	
	function init() {
		iFrameDoc = iFrame.contentDocument || iFrame.contentWindow.document;
		if (iFrameDoc !== undefined && iFrameDoc.readyState !== "loading") {
			xpath = require("modules/xpath")(iFrameDoc);
			iFrame.contentWindow.addEventListener('beforeunload', dialog.showLoadingDialog, true);
		}
		iFrame.addEventListener('load', onLoaded, true);
	}
	
	function onLoaded() {
		iFrameDoc = iFrame.contentDocument || iFrame.contentWindow.document;
		xpath = require("modules/xpath")(iFrameDoc);
		if (doRecord) {
			iFrameDoc.addEventListener("click", onClick, true);
		}
		iFrame.contentWindow.addEventListener('beforeunload', dialog.showLoadingDialog, true);
		dialog.hideDialog();
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
		currentStep = {
			url: iFrame.contentWindow.location.href,
			tag: event.target.tagName,
			idPath: xpath.getIdPath(event.target),
			hierarchyPath: xpath.getHierarchyPath(event.target)
		};
		const rect = iFrame.getBoundingClientRect();
		const mouseX = event.clientX + rect.left;
		const mouseY = event.clientY + rect.top;
		const options = ["Click", "Extract Text", "Cancel"];
		dialog.showSelectDialog(options, onActionSelected, mouseX, mouseY);
	}
	
	function onActionSelected(action) {
		switch (action) {
			case "Click":
				emulateClick();
				break;
			case "Extract Text":
				break;
			default:
				currentStep = null;
				return;
		}
		currentStep.action = action;
		steps.push(currentStep);
		appendStep();
		currentStep = null;
	}
	
	function emulateClick() {
		const element = xpath.getElement(currentStep.idPath) || xpath.getElement(currentStep.hierarchyPath);
		if (element !== null) {
			preventPropagation = false;
			element.click();
			preventPropagation = true;
		}
	}
	
	function appendStep() {
		const step = document.createElement('li');
		step.innerHTML = stepHtml;
		const stepNumber = step.getElementsByClassName("step-number")[0];
		const stepActionNode = step.getElementsByClassName("step-action")[0];
		const stepUrl = step.getElementsByClassName("step-url")[0];
		stepNumber.innerHTML = steps.length;
		stepActionNode.textContent = currentStep.action;
		stepUrl.textContent = currentStep.url;
		stepUrl.href = currentStep.url;
		stepList.appendChild(step);
	}
	
	function isRecording() {
		return doRecord;
	}
	
	function start() {
		doRecord = true;
		preventPropagation = true;
		steps = [];
		stepList.innerHTML = "";
		if (iFrameDoc !== undefined) {
			iFrameDoc.addEventListener("click", onClick, true);
		}
	}
	
	function stop() {
		doRecord = false;
		preventPropagation = false;
		if (iFrameDoc !== undefined) {
			iFrameDoc.removeEventListener("click", onClick, true);
		}
	}
	
	function save() {
		//nw.__dirname
	}
	
	function run() {
		if (steps.length == 0) {
			return;
		}
		dialog.showInfoDialog("Executing Script...");
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