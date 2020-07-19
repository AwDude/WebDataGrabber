const store = global.nw.Window.get().cookies;

function getUrl(cookie) {
	return "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path;
}

function removeAll(cookies) {
	cookies.forEach(remove);
}

function remove(cookie) {
	var details = {
		url: getUrl(cookie),
		name: cookie.name
	};
	store.remove(details);
}

function clear() {
	store.getAll({}, removeAll);
}

function fakeSet() {
	chrome.webRequest.onHeadersReceived.addListener(
	function (details) {
		details.responseHeaders.forEach(function(header) {
			if (header.name === "set-cookie") {
				console.log(header);
			}
		});
		return {responseHeaders : details.responseHeaders};
	},
	{urls: ["<all_urls>"]},
	["blocking", "responseHeaders"]);
}

module.exports = {
	clear: clear,
	fakeSet: fakeSet
}