const overlayStyle =   "position: absolute; \
						background: rgba(0, 0, 0, 0.3); \
						top: 0; \
						right: 0; \
						bottom: 0; \
						left: 0;"

const dialogStyle =    "position: absolute; \
						border: 1px solid black; \
						box-shadow: 4px 4px 8px black; \
						background: white; \
						-webkit-transform: translate(-50%, -50%); \
						transform: translate(-50%, -50%);"

module.exports = function() {
	
	var overlay;
	var dialog;
	
	function init() {
		dialog = doc.createElement("div");
		dialog.style.cssText = dialogStyle;
		overlay = doc.createElement("div");
		overlay.style.cssText = overlayStyle;
		overlay.appendChild(dialog);
	}

	function showDialog() {
		if (!doc.body.contains(overlay)) {
			doc.body.appendChild(overlay);
		}
	}

	function hideDialog() {
		doc.body.removeChild(overlay);
	}
	
	function showSelectDialog(optionsArr, onSelectFunc, x = null, y = null) {
		if (!Array.isArray(optionsArr) || optionsArr.length <= 0) {
			console.log("showSelectDialog: something seems to be wrong with the optionsArr param");
			return;
		}
		dialog.innerHTML = "";
		if (x === null || y === null) {
			dialog.style.left = "50%";
			dialog.style.top = "50%";
		} else {
			dialog.style.left = x + "px";
			dialog.style.top = y + "px";
		}
		optionsArr.forEach(function(option) {
			const btn = doc.createElement("button");
			btn.style.margin = "4px";
			btn.style.display = "block";
			btn.style.width = "calc(100% - 8px)";
			btn.style.height = "100%";
			btn.innerHTML = option;
			btn.onclick = function(){ 
				onSelectFunc(option);
				hideDialog();
			};
			dialog.appendChild(btn);  
		});
		showDialog();
	}
	
	function showLoadingDialog() {
		showInfoDialog("Loading...");
	}
	
	function showInfoDialog(message) {
		dialog.style.left = "50%";
		dialog.style.top = "50%";
		dialog.innerHTML = "<span style='margin: 4px;'>" + message + "</span>";
		showDialog();
	}
	
	init();
	return {
		showSelectDialog: showSelectDialog,
		showLoadingDialog: showLoadingDialog,
		showInfoDialog: showInfoDialog,
		hideDialog: hideDialog
	};
}