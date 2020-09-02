const Select = require("modules/OptimalSelect").select;
const selectOpts = {
		ignore: {
			attribute (name, value, defaultPredicate) {
				return name === "id" || defaultPredicate(name, value);
			}
		}
	};
	
/*
	const selectOpts = {
		root: Browser.document,
		ignore: {
			attribute (name, value, defaultPredicate) {
				return name === "id" || defaultPredicate(name, value);
			}
		}
	};
*/

function getLoopSelector(element1, element2) {
	if (element1 === element2) {
		console.log("getLoopSelector: returning null because element1 === element2");
		return null;
	}
	
	const selector1 = Select(element1, selectOpts);
	const selector2 = Select(element2, selectOpts);
	
	const commonLength = getCommonLength(selector1, selector2);
	const containerSelectorLength = selector1.lastIndexOf(" ", commonLength);
	const containerSelector = selector1.slice(0, containerSelectorLength);
	console.log(containerSelector);
	const container = element1.ownerDocument.querySelector(containerSelector);
	
	const parentSelectorLength1 = selector1.indexOf(" ", containerSelectorLength + 1);
	const parentSelector1 = selector1.slice(containerSelectorLength, parentSelectorLength1);
	const parent1 = container.querySelector(parentSelector1);
	
	const parentSelectorLength2 = selector2.indexOf(" ", containerSelectorLength + 1);
	const parentSelector2 = selector2.slice(containerSelectorLength, parentSelectorLength2);
	const parent2 = container.querySelector(parentSelector2);
	
	if (parent1.tag !== parent2.tag) {
		console.log("getLoopSelector: returning null because parent1.tag !== parent2.tag");
		return null;
	}
}

function getCommonLength(string1, string2) {
	for (var i = 0; i < string1.length; i++) {
		if (string1.charAt(i) !== string2.charAt(i)) {
			return i;
		}
	}
}
	
module.exports = {
	getLoopSelector: getLoopSelector
}