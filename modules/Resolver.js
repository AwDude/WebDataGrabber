const XPath = require("modules/xpath");

function getScheme(element) {
}

function getElements(parent, scheme) {

}

function getElement(parent, scheme) {
	var element = XPath.getElement(parent, scheme.hierarchyPath);
	if (element === null) {
		element = XPath.getElement(parent, scheme.idPath);
	}
	return element;
}
	
module.exports = {
	getScheme: getScheme,
	getElements: getElements,
	getElement: getElement
}