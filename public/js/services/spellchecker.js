// Service for initialize the Electron's spellchecker.
myApp.factory('Spellchecker', ['$rootScope', 'Languages', function($rootScope, Languages) {
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
        // Update locale.
        var language = Languages.lang[data.type];
        var locale = Languages.getLangLocale(language);
        spell_language = locale;

        // Set active language on main process (later it will be used for suggestions on misspelled words).
        ipcRenderer.sendSync('dictionary.set-active-lang', spell_language);
    });

    // Return an empty object (since the service works only with events).
    return {};
}]);

