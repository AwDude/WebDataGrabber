module.exports = function(iFrame, urlInput) {
	
	var preventNavigation = false;
	
	function init() {
		onLoad(bindUrlInputToIFrame);
		redirectNavigationToIFrame();
		storeUrlOnClose();
		loadUrlOnEnterPress();
		loadLastUrl();
	}
	
	function redirectNavigationToIFrame() {
		const win =	nw.Window.get();
		const onNavigate = function(frame, url, policy) {
			policy.ignore();
			if (!preventNavigation) {
				iFrame.src = url;
			}
		};
		win.on('new-win-policy', onNavigate);
		win.on('navigation', onNavigate);
	}

	function storeUrlOnClose() {
		nw.Window.get().on('close', function() {
			this.hide();
			if (isHttp(urlInput.value)) {
				localStorage.lastUrl = urlInput.value;
			}
			this.close(true);
		});
	}

	function isHttp(url) {
		return /^https?:\/\//i.test(url);
	}

	function loadUrl() {
		if (preventNavigation) {
			return;
		}
		var url = urlInput.value;
		if (!isHttp(url)) {
			url = 'https://' + url;
		}
		iFrame.src = url;
	}
	
	function loadUrlOnEnterPress() {
		urlInput.addEventListener("keypress", function(event) {
			if (event.which == 13) {
				loadUrl();
				return false;
			}
		});
	}
	
	function loadLastUrl() {
		if (isHttp(localStorage.lastUrl)) {
			iFrame.src = localStorage.lastUrl;
		}
	}

	function bindUrlInputToIFrame() {
		if (iFrame.contentWindow === undefined) {
			return;
		}
		const win = iFrame.contentWindow;
		const nativePushState = win.history.pushState;
		const nativeReplaceState = win.history.replaceState;
		
		win.onpopstate = function(event) {
			urlInput.value = win.location.href;
		}
		win.history.pushState = function(state) {
			const nativeResult = nativePushState.apply(win.history, arguments);
			win.onpopstate({state: state});
			return nativeResult;
		}
		win.history.replaceState = function(state) {
			const nativeResult = nativeReplaceState.apply(win.history, arguments);
			win.onpopstate({state: state});
			return nativeResult;
		}
		urlInput.value = win.location.href;
	}
	
	function getDocument() {
		return iFrame.contentDocument || iFrame.contentWindow.document;
	}
	
	function onLoad(callback, callIfAlreadyLoaded = true) {
		const doc = getDocument();
		if (doc !== undefined && doc.readyState !== "loading", callIfAlreadyLoaded) {
			callback();
		}
		iFrame.addEventListener("load", callback, true);
	}
	
	init();
	return {
		loadUrl: loadUrl,
		onLoad: onLoad,
		get url() {
			return iFrame.contentWindow.location.href;
		},
		get window() {
			return iFrame.contentWindow;
		},
		get document() {
			return getDocument();
		},
		get boundingRect() {
			return iFrame.getBoundingClientRect();
		},
		get preventNavigation() {
			return preventNavigation;
		},
		set preventNavigation(val) {
			preventNavigation = val;
		}
	};
}