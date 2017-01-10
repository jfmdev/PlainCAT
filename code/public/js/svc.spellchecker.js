// Service for initialize the Electron's spellchecker.
myApp.factory('Spellchecker', ['$rootScope', 'Settings', function($rootScope, Settings) {
    // Initialize variables.
    var webFrame = require('electron').webFrame;
    var ipcRenderer = require('electron').ipcRenderer;
    var spell_language = 'en-US';
    
    // Initialize spell checker.
    webFrame.setSpellCheckProvider("en-US", false, {
        spellCheck: function(text) {
            var res = ipcRenderer.sendSync('dictionary.check-word', spell_language, text);
            return res != null? res : true;
        }
    });
 
    // When a paragraph is focused, update the language used by the spell checker.
    $rootScope.$on('paragraph-focused', function(event, data) {
        var locale = Settings.getLocale(data.type);
        spell_language = locale;
    });
    
    // Return an empty object (since the service works only with events).
    return {};
}]);

