const Step = require("modules/Step");

module.exports.create = function(url) {
	
	const parentStepStack = [];
	const firstStep = Step.create(true);
	var currentStep = firstStep;
	
	function getFirstHtmlElement(element) {
		if (element instanceof iFrame.contentWindow.HTMLElement) {
			return element;
		} else {
			return getFirstHtmlElement(element.parentNode);
		}
	}
	
	function addStep(element, action) {
		if (action === "Repeat next steps") {
			const repeatStep = Step.create(false);
			parentStepStack.push(currentStep);
			currentStep.addAction(action, repeatStep)
			
		}
		
		const htmlEl = getFirstHtmlElement(element);
		const path = XPath.getHierarchyPath(htmlEl);

	}
	
	return {
		get url() {
			return url;
		}
	};
}

module.exports.getAvailable = function() {
}

module.exports.load = function() {
}