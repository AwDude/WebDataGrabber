module.exports = function(iFrame, urlInput) {
	
	function init() {
		iFrame.addEventListener("load", bindUrlInputToIFrame);
		redirectNavigationToIFrame();
		storeUrlOnClose();
		loadUrlOnEnterPress();
		loadLastUrl();
	}
	
	function redirectNavigationToIFrame() {
		const win =	nw.Window.get();
		const onNavigate = function(frame, url, policy) {
			policy.ignore();
			iFrame.src = url;
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
		const history = win.history;
		const nativePushState = history.pushState;
		const nativeReplaceState = history.replaceState;
		
		win.onpopstate = function(event) {
			urlInput.value = win.location.href;
		}
		history.pushState = function(state) {
			const nativeResult = nativePushState.apply(history, arguments);
			win.onpopstate({state: state});
			return nativeResult;
		}
		history.replaceState = function(state) {
			const nativeResult = nativeReplaceState.apply(history, arguments);
			win.onpopstate({state: state});
			return nativeResult;
		}
		urlInput.value = win.location.href;
	}
	
	init();
	
	return {
		loadUrl: loadUrl,
		get document() {
			return iFrame.contentDocument || iFrame.contentWindow.document;
		}
	};
}