
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
            if(type && language) {
                // Save values.
                languages[type] = language;
                ipcRenderer.sendSync('settings-set', {'name': ("locale."+type), 'value': language.locale });
              
                // Load dictionary.
                ipcRenderer.send('dictionary.load', language.locale);
            }
        },
        
        // Get the language code of the source or the destionation text.
        getLanguageCode: function(type) {
            return (languages[type])? languages[type].lang_code : 'en';
        },
        
        // Get the locale of the source or the destionation text.
        getLocale: function(type) {
            if(languages[type]) {
                return languages[type].locale;
            } else {
                var res = ipcRenderer.sendSync('settings-get', 'locale.' + type);
                if(res) { 
                    return res; 
                } else { 
                    return type == 'source'? 'en-US' : 'es-ES'; 
                }
            }
        },
        
        // Update the spellchecker language.
        updateSpellchecker: function(type) {
            if(languages[type]) {
                spell_language = languages[type].locale;
            }
        }
    };

    // Return service.
    return service;
});

