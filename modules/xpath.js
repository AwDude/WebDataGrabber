module.exports = function(targetDoc) {

	function getIdPath(element) {
		if (element.id !== '') {
			return 'id("' + element.id + '")';
		}
		if (element === targetDoc.body) {
			return element.tagName;
		}

		var nodePos = 1;
		const siblings = element.parentNode.childNodes;
		
		for (var i = 0; i < siblings.length; i++) {
			var sibling = siblings[i];
			if (sibling === element) {
				return getIdPath(element.parentNode) + '/' + element.tagName + '[' + (nodePos) + ']';
			}
			if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === element.tagName) {
				nodePos++;
			}
		}
	}
	
	function getHierarchyPath(element) {
		if (element === targetDoc.body) {
			return element.tagName;
		}

		var nodePos = 1;
		const siblings = element.parentNode.childNodes;
		
		for (var i = 0; i < siblings.length; i++) {
			var sibling = siblings[i];
			if (sibling === element) {
				return getHierarchyPath(element.parentNode) + '/' + element.tagName + '[' + (nodePos) + ']';
			}
			if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === element.tagName) {
				nodePos++;
			}
		}
	}
	
	function getElement(xpath) {
		try {
			return targetDoc.evaluate(xpath, targetDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		} catch(error) { 
			console.log(error);
			return null;
		}
	}

	return {
		getElement: getElement,
		getHierarchyPath: getHierarchyPath,
		getIdPath: getIdPath
	};
}