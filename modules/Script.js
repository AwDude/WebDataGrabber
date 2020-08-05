const Step = require("modules/Step");

module.exports.create = function(url) {
	
	const firstStep = Step.create(true);
	const parentStepStack = [];
	
	function getFirstHtmlElement(element) {
		if (element instanceof iFrame.contentWindow.HTMLElement) {
			return element;
		} else {
			return getFirstHtmlElement(element.parentNode);
		}
	}
	
	function addStep(element, action) {
		
		const htmlEl = getFirstHtmlElement(element);
		const path = XPath.getHierarchyPath(htmlEl);

	}
	
	return {
		
	};
}

module.exports.getAvailable = function() {
}

module.exports.load = function() {
}