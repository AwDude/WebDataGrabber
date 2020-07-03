const maxRunAttempts = 120;
const runStepDelay = 500;
const repeatIndent = 20;
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
	var initStep = { number: 0 };
	var lastStep;
	var preventPropagation = false;
	var doRecord = false;
	var doRun = false;		
	var lastHoverElement;
	var lastHoverElementBorder;
	var repeatCount = 0;
	
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
			runStep(initStep.nextStep);
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
		lastStep.nextStep = {
			number: lastStep.number + 1,
			url: iFrame.contentWindow.location.href,
			tag: element.tagName,
			hierarchyPath: xpath.getHierarchyPath(element),
			nextStep: null
		};
		const rect = iFrame.getBoundingClientRect();
		const mouseX = event.clientX + rect.left;
		const mouseY = event.clientY + rect.top;
		const options = ["Click", "Extract Text", "Repeat Next Steps", "Cancel"];
		const message = "Select Action";
		dialog.showSelectDialog(message, options, onActionSelected, mouseX, mouseY);
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
				const element = xpath.getElement(lastStep.nextStep.hierarchyPath);
				emulateClick(element);
				break;
			case "Extract Text":
				break;
			case "Repeat Next Steps":
				
				break;
			default:
				step.nextStep = null;
				return;
		}
		lastStep = lastStep.nextStep;
		lastStep.action = action;
		appendStep();
		if (action === "Repeat Next Steps") {
			repeatCount++;
		}
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
		step.style.paddingLeft = (repeatCount * repeatIndent) + "px";
		step.innerHTML = stepHtml;
		const stepNumber = step.getElementsByClassName("step-number")[0];
		const stepActionNode = step.getElementsByClassName("step-action")[0];
		const stepUrl = step.getElementsByClassName("step-url")[0];
		stepNumber.innerHTML = lastStep.number;
		stepActionNode.textContent = lastStep.action;
		stepUrl.textContent = lastStep.url;
		stepUrl.href = lastStep.url;
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
		repeatCount = 0;
		initStep.nextStep = null;
		lastStep = initStep;
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
		if (initStep.nextStep === null) {
			return;
		}
		doRun = true;
		iFrame.src = initStep.nextStep.url;
	}
	
	function runStep(step, attempts = 0) {
		if (attempts >= maxRunAttempts) {
			console.log("Run aborted: Too many attempts to find specified element!");
			onRunFinished();
			return;
		}
		if (step === null) {
			console.log("Finished run successfully!");
			onRunFinished();
			return;
		}
		const element = xpath.getElement(step.hierarchyPath);
		console.log("Step: " + step.number + ", Attempts: " + attempts + ", Element: " + element + ", Path: " + step.hierarchyPath);
		if (element === null) {
			setTimeout(function() { runStep(step, attempts + 1); }, runStepDelay);
			return;
		}
		switch (step.action) {
			case "Click":
				emulateClick(element);
				setTimeout(function() { runStep(step.nextStep); }, runStepDelay);
				break;
			case "Extract Text":
				console.log("Extract Text: ", element.innerText);
				runStep(step.nextStep);
				break;
			case "Repeat Next Steps":
				// foreach li 
				break;
			default:
				console.log("Run aborted: Invalid Step Action!");
				onRunFinished();
				return;
		}
	}
	
	function onRunFinished() {
		if (doRecord) {
			preventPropagation = true;
		}
		dialog.hideDialog();
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