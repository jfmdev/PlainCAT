// Service for initialize the Electron's spellchecker.
myApp.factory('Spellchecker', ['$rootScope', 'Shared', function($rootScope, Shared) {
    // Initialize variables.
    var webFrame = require('electron').webFrame;
    var ipcRenderer = require('electron').ipcRenderer;
    var spellLanguage = 'en_US';

    // Initialize spell checker.
    webFrame.setSpellCheckProvider("en-US", false, {
        spellCheck: function(text) {
            var res = ipcRenderer.sendSync('dictionary.check-word', spellLanguage, text);
            return res != null? res : true;
        }
    });

    // Method for load a dictionary.
    var loadDictionary = function(langCode) {
        var locale = Shared.getLanguageLocale(langCode);
        if(locale) {
            ipcRenderer.send('dictionary.load', locale);
        }
    };

    // When a language is changed, load the corresponding dictionary.
    Shared.store.watchAll(function(key, newLangCode) {
        if(key === 'fromLang' || key === 'toLang') {
            loadDictionary(newLangCode);
        }
    });

    // When a paragraph is focused, update the language used by the spell checker.
    $rootScope.$on('paragraph-focused', function(event, data) {
        // Update locale.
        var langCode = Shared.getLanguage(data.type);
        var locale = Shared.getLanguageLocale(langCode);
        spellLanguage = locale;

        // Set active language on main process (later it will be used for suggestions on misspelled words).
        ipcRenderer.sendSync('dictionary.set-active-lang', spellLanguage);
    });

    // Load initial dictionaries.
    for(var i=0; i<2; i++) {
        var langCode = Shared.store.get(i < 1 ? 'fromLang' : 'toLang');
        loadDictionary(langCode);
    }

    // Return an empty object (since the service works only with events).
    return {};
}]);
