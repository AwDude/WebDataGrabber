const maxRunAttempts = 120;
const runStepDelay = 500;
const Step = require("modules/step");

module.exports.getAvailable = function() {
}

module.exports.load = function(iFrame, stepList) {
}

module.exports.create = function(iFrame, stepList) {
	
	const XPath = require("modules/xpath")(iFrame);
	var firstStep = null;
	var currentStep = null;
	var nestingCount = 0;
	var onRunFinished;
	var nextStepNested = false;
	
	function getFirstHtmlElement(element) {
		if (element instanceof iFrame.contentWindow.HTMLElement) {
			return element;
		} else {
			return getFirstHtmlElement(element.parentNode);
		}
	}
	
	function emulateClick(element) {
		if (element !== null) {
			const event = new Event('click', {"bubbles": true, "cancelable": false});
			element.dispatchEvent(event);
		}
	}
	
	function runNextStep(step, repeatElements = []) {
		if (step.next === null) {
			if (repeatElements.length > 0) {
				iFrame.src = step.parent.url;
				setTimeout(function() { runStep(step.parent.child, 0, repeatElements.shift()); }, 2000);
			} else if (step.parent === null) {
				runStep(null);
			} else {
				runStep(step.parent.next, 0, repeatElements);
			}
		} else {
			runStep(step.next, 0, repeatElements);
		}
	}
	
	function runStep(step, attempts = 0, repeatElements = []) {
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
		var element;
		if (repeatElements.length > 0) {
			console.log(repeatElements);
			element = XPath.getElement(step.path, repeatElements[0]);
		} else {
			element = XPath.getElement(step.path);
		}
		console.log("Step: " + step.number + ", Attempts: " + attempts);
		if (element === null) {
			console.log(step.path);
			setTimeout(function() { runStep(step, attempts + 1); }, runStepDelay);
			return;
		}
		switch (step.action) {
			case "Click":
				emulateClick(element);
				setTimeout(function() { runNextStep(step, repeatElements); }, runStepDelay);
				break;
			case "Extract Text":
				console.log("Extract Text: ", element.innerText);
				runNextStep(step, repeatElements)
				break;
			case "Repeat Next Steps":
				if (step.child !== null) {
					runStep(step.child, 0, element.children);
					console.log(element.children);
				} else {
					runNextStep(step, repeatElements)
				}
				break;
			default:
				console.log("Run aborted: Invalid Step Action!");
				onRunFinished();
				return;
		}
	}
	
	function getStartUrl() {
		if (firstStep !== null) {
			return firstStep.url;
		}
		return null;
	}
	
	// Allow propagation before usage
	function addStep(element, action) {
		
		const htmlEl = getFirstHtmlElement(element);
		var path = XPath.getHierarchyPath(htmlEl);
		const url = iFrame.contentWindow.location.href;
		
		if (nextStepNested) {
			const index = path.lastIndexOf("LI");
			if (index > 0) {
				path = path.substring(index + 6, path.length);
			}
		}
		
		if (firstStep === null) {
			currentStep = firstStep = new Step(1, url, htmlEl.tagName, path, action);
		} else if (nextStepNested) {
			nextStepNested = false;
			currentStep.child = new Step(1, url, htmlEl.tagName, path, action, currentStep);
			currentStep = currentStep.child;
		} else {
			const number = currentStep.number + 1;
			currentStep.next = new Step(number, url, htmlEl.tagName, path, action, currentStep.parent);
			currentStep = currentStep.next;
		}
		
		stepList.appendChild(currentStep.asListItem(nestingCount));
		
		switch (action) {
			case "Click":
				emulateClick(htmlEl);
				break;
			case "Repeat Next Steps":
				const index = path.lastIndexOf("LI");
				if (index > 0) {
					currentStep.path = path.substring(0, index - 1);
				}
				nextStepNested = true;
				nestingCount++;
				break;
		}
	}
	
	function stopRepeat() {
		if (nextStepNested) {
			nextStepNested = false;
		} else if (currentStep !== null && currentStep.parent !== null) {
			currentStep = currentStep.parent;
		}
	}
	
	function removeLastStep() {
		
	}
	
	function save() {
		//nw.__dirname
	}
	
	function run(onFinish) {
		if (firstStep === null) {
			onFinish();
			return;
		}
		onRunFinished = onFinish;
		runStep(firstStep);
	}
	
	return {
		//get currentStep() { return currentStep; },
		getStartUrl: getStartUrl,
		addStep: addStep,
		stopRepeat: stopRepeat,
		removeLastStep: removeLastStep,
		save: save,
		run: run
	};
}