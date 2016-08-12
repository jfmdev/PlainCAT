
// Declare module.
var translatorSvc = angular.module('translatorSvc', []);

// Service for initialize the application's menu.
translatorSvc.factory('Translator', function() {
    // Initialize variables.
    var languages = {
        'destination': null,
        'source': null
    }
    
    // Initialize spell checker.
    var spell_language = 'en-US';
    webFrame.setSpellCheckProvider("en-US", false, {
        spellCheck: function(text) {      
            var res = ipcRenderer.sendSync('dictionary.check-word', spell_language, text);
            return res != null? res : true;
        }
    });
 
    // Define service.
    var service = {
        // Set the language for either the source or the destination texts.
        setLanguage: function(type, language) {
            // Save values.
            languages[type] = language;
          
            // Load dictionary.
            ipcRenderer.send('dictionary.load', language.dictionary);
        },
        
        // Get the language of the source or the destionation text.
        getLanguage: function(type) {
            return (languages[type])? languages[type].lang_code : 'en';
        },
        
        // Update the spellchecker language.
        updateSpellchecker: function(type) {
            if(languages[type]) {
                spell_language = languages[type].dictionary;
            }
        }
    };

    // Return service.
    return service;
});

