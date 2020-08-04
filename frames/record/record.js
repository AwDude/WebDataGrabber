var Recorder;
var Browser;

function onDocReady() {
	nw.Window.get().showDevTools();
	
	// enable context object usage in modules
	global.console = console;
	global.doc = document;
	
	require("modules/Dragbar")(script_container, 8, dragbar, iframe);
	Browser = require("modules/Browser")(iframe, url_input);
	Recorder = require("modules/Recorder")(Browser, step_list);

}

function toggleRecord() {
	if (Recorder.isRecording()) {
		Recorder.stop();
		record_btn.textContent = "Record Steps";
	} else {
		Recorder.start();
		record_btn.textContent = "Stop Recording";
	}
}

(function docReady(onReady) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(onReady, 1); // call on next available tick
    } else {
        document.addEventListener("DOMContentLoaded", onReady);
    }
})(onDocReady);