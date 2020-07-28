const Resolver = require("modules/Resolver");

module.exports.create = function(url, parentGroup) {
	
	var temp;
	var steps;

	function run(iFrame) {
		temp.iFrame = iFrame;
		temp.currentStep = 0;
		temp.elements = Resolver.getElements(parent, steps);
	}
	
	function add(step) {
		
	}
	
	return {
		run: run
	};
}