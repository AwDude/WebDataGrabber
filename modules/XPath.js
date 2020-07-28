const evaluator = new XPathEvaluator();

function getHierarchyPath(element) {
	if (element.tagName === "BODY") {
		return "HTML/BODY";
	}
	var nodePos = 1;
	const siblings = element.parentNode.children;
	
	for (var i = 0; i < siblings.length; i++) {
		var sibling = siblings[i];
		if (sibling === element) {
			const parentPath = getHierarchyPath(element.parentNode);
			if (parentPath === null) {
				return null;
			}
			return parentPath + '/' + element.tagName + '[' + nodePos + ']';
		}
		if (sibling.tagName === element.tagName) {
			nodePos++;
		}
	}
	return null;
}

function getIDPath(element) {
	if (element.id !== '') {
        return 'id("' + element.id + '")';
	}
	if (element.tagName === "BODY") {
		return "HTML/BODY";
	}
	var nodePos = 1;
	const siblings = element.parentNode.children;
	
	for (var i = 0; i < siblings.length; i++) {
		var sibling = siblings[i];
		if (sibling === element) {
			const parentPath = getIDPath(element.parentNode);
			if (parentPath === null) {
				return null;
			}
			return parentPath + '/' + element.tagName + '[' + nodePos + ']';
		}
		if (sibling.tagName === element.tagName) {
			nodePos++;
		}
	}
	return null;
}

function getElement(parent, xpath) {
	try {
		return evaluator.evaluate(xpath, parent, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	} catch(error) { 
		console.log("XPath evaluation error: ", error);
		return null;
	}
}
	
module.exports = {
	getElement: getElement,
	getHierarchyPath: getHierarchyPath,
	getIDPath: getIDPath
}