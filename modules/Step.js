
module.exports.create = function(isRoot) {
	
	const actions = [];
	const data = [];
	
	function addAction(action, data) {
		actions.push(action);
		schemes.push(data);
	}
	
	return {
		get isRoot() {
			return isRoot;
		},
		nextStep: null,
		addAction: addAction	
	};
}