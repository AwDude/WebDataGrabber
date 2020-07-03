const nestingIndent = 20;
const liHtml = "	<div class='step'> \
						<h3 class='step-number'></h3> \
						<div class='step-info'> \
							<span class='step-action'></span> \
							<a class='step-url'></span> \
						</div> \
					</div>";
					
module.exports = class Step {

	constructor(number, url, tag, path, action, parent = null) {
		this.number = number;
		this.url = url;
		this.tag = tag;
		this.path = path;
		this.action = action;
		this.parent = parent;
		this.child = null;
		this.next = null;
	}
	
	asListItem(nestingCount = 0) {
		const li = doc.createElement('li');
		li.innerHTML = liHtml;
		li.style.paddingLeft = (nestingCount * nestingIndent) + "px";
		const liNumber = li.getElementsByClassName("step-number")[0];
		const liAction = li.getElementsByClassName("step-action")[0];
		const liUrl = li.getElementsByClassName("step-url")[0];
		// TODO
		liNumber.innerHTML = this.number;
		liAction.textContent = this.action;
		liUrl.textContent = this.url;
		liUrl.href = this.url;
		return li;
	}
};