module.exports = function(iFrame) {
	
	function getHierarchyPath(element) {
		if (element === iFrame.doc.body) {
			return "HTML/BODY";
		}
		var nodePos = 1;
		const siblings = element.parentNode.childNodes;
		
		for (var i = 0; i < siblings.length; i++) {
			var sibling = siblings[i];
			if (sibling === element) {
				const parentPath = getHierarchyPath(element.parentNode);
				if (parentPath === null) {
					return null;
				}
				return parentPath + '/' + element.tagName + '[' + nodePos + ']';
			}
			if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === element.tagName) {
				nodePos++;
			}
		}
		return null;
	}
	
	function getElement(xpath, parent = null) {
		try {
			return iFrame.doc.evaluate(xpath, parent || iFrame.doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		} catch(error) { 
			console.log(error);
			return null;
		}
	}

	return {
		getElement: getElement,
		getHierarchyPath: getHierarchyPath
	};
}