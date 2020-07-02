const maxRunAttempts = 120;
const runStepDelay = 500;
const dialog = require("modules/dialog")();
const stepHtml = "	<div class='step'> \
						<h3 class='step-number'></h3> \
						<div class='step-info'> \
							<span class='step-action'></span> \
							<a class='step-url'></span> \
						</div> \
					</div>";
					
module.exports = function(iFrame, stepList) {
	
	const xpath = require("modules/xpath")(iFrame);
	var steps = [];
	var currentStep;
	var preventPropagation = false;
	var doRecord = false;
	var doRun = false;		
	var lastHoverElement;
	var lastHoverElementBorder;
	
	function init() {
		if (iFrame.doc !== undefined && iFrame.doc.readyState !== "loading") {
			iFrame.contentWindow.addEventListener('beforeunload', dialog.showLoadingDialog, true);
		}
		iFrame.addEventListener('load', onLoaded, true);
	}
	
	function onLoaded() {
		if (doRecord) {
			iFrame.doc.addEventListener("click", onClick, true);
		}
		iFrame.contentWindow.addEventListener('beforeunload', dialog.showLoadingDialog, true);
		dialog.hideDialog();
		if (doRun) {
			dialog.showInfoDialog("Executing Script...");
			preventPropagation = false;
			doRun = false;
			runStep(0);
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
		const element = getFirstHtmlElement(event.target);
		currentStep = {
			url: iFrame.contentWindow.location.href,
			tag: element.tagName,
			//idPath: xpath.getIdPath(iFrame.doc, element),
			hierarchyPath: xpath.getHierarchyPath(element)
		};
		const rect = iFrame.getBoundingClientRect();
		const mouseX = event.clientX + rect.left;
		const mouseY = event.clientY + rect.top;
		const options = ["Click", "Extract text", "Repeat next steps on children", "Cancel"];
		dialog.showSelectDialog(options, onActionSelected, mouseX, mouseY);
	}
	
	function getFirstHtmlElement(element) {
		if (element instanceof iFrame.contentWindow.HTMLElement) {
			return element;
		} else {
			return getFirstHtmlElement(element.parentNode);
		}
	}
	
	function onActionSelected(action) {
		switch (action) {
			case "Click":
				const element = xpath.getElement(currentStep.hierarchyPath);
				emulateClick(element);
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
	
	function emulateClick(element) {
		if (element !== null) {
			preventPropagation = false;
			const event = new Event('click', {"bubbles": true, "cancelable": false});
			element.dispatchEvent(event);
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
	
	function onHover(event) {
		if (lastHoverElement !== undefined) {
			lastHoverElement.style.border = lastHoverElementBorder;
		}
		lastHoverElement = event.target;
		lastHoverElementBorder = lastHoverElement.style.border;
		lastHoverElement.style.border = "2px solid red";
	}
	
	function start() {
		doRecord = true;
		preventPropagation = true;
		steps = [];
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
		if (steps.length == 0) {
			return;
		}
		doRun = true;
		iFrame.src = steps[0].url;
	}
	
	function runStep(stepNumber, attempts = 0) {
		if (stepNumber >= steps.length || attempts >= maxRunAttempts) {
			if (stepNumber === steps.length) {
				console.log("Finished run successfully!");
			}
			if (doRecord) {
				preventPropagation = true;
			}
			dialog.hideDialog();
			return;
		}
		const step = steps[stepNumber];
		const element = xpath.getElement(step.hierarchyPath);
		console.log("Step: " + stepNumber + ", Attempts: " + attempts + ", Element: " + element + ", Path: " + step.hierarchyPath);
		if (element === null) {
			setTimeout(function() { runStep(stepNumber, attempts + 1); }, runStepDelay);
			return;
		}
		switch (step.action) {
			case "Click":
				emulateClick(element);
				setTimeout(function() { runStep(stepNumber + 1); }, runStepDelay);
				break;
			case "Extract Text":
				console.log("Extract Text: ", element.innerText);
				runStep(stepNumber + 1);
				break;
			default:
				console.log("Run aborted: Invalid Step Action!");
				return;
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