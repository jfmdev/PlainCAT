// Load dependency.
const ElectronSearchText = require('electron-search-text');

// Initialize searcher.
var searcher = new ElectronSearchText({
    target: '#app'
});

// Define behaviour for buttons from the Find panel.
document.getElementById("cancelSearch").onclick = function() {
    searcher.hide();
};

document.getElementById("previousSearch").onclick = function() {
    searcher._onKeydown({ code: 'Enter', shiftKey: true });
};

document.getElementById("nextSearch").onclick = function() {
    searcher._onKeydown({ code: 'Enter', shiftKey: false });
};

// Re-print console messages from webview and listen IPC events..
var webview = document.querySelector('webview')

webview.addEventListener('console-message', function(event) {
    console.log(event.message);
});

webview.addEventListener('ipc-message', function(event) {
    if(event.channel == 'toggleSearch') {
        searcher.emit('toggle');
    }
});
