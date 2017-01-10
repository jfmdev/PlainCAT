
// Declare module.
var spellcheckerSvc = angular.module('spellcheckerSvc', ['translatorSvc']);

// Service for initialize the Electron's spellchecker.
spellcheckerSvc.factory('Spellchecker', function($rootScope, Translator) {
    // Initialize variables.
    var webFrame = require('electron').webFrame;
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
        var locale = Translator.getLocale(data.type);
        spell_language = locale;       
    });
    
    // Return an empty object (since the service works only with events).
    return {};
});

