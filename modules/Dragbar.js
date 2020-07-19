const grabberMinWidth = 128; // Min width, otherwise grabber content will collapse to width of 0

module.exports = function(leftBox, leftBoxMargin, dragBar, iFrame) {
	
	var doDrag = false;
	
	doc.addEventListener('mousedown', function(event) {
		iFrame.style.pointerEvents = "none";
		iFrame.style.userSelect = "none";
		doc.body.style.userSelect = "none";
		if (event.target === dragBar) {
			doDrag = true;
		}
	});
	doc.addEventListener('mousemove', function(event) {
		if (!doDrag) {
			return false;
		}
		const pointerRelativeX = event.clientX - (leftBoxMargin * 2);
		leftBox.style.width = (Math.max(grabberMinWidth, pointerRelativeX)) + 'px';
		leftBox.style.flexGrow = 0;
	});
	doc.addEventListener('mouseup', function(event) {
		iFrame.style.pointerEvents = "auto";
		iFrame.style.userSelect = "auto";
		doc.body.style.userSelect = "auto";
		doDrag = false;
	});
};