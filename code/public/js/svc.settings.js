// Service for initialize the application's menu.
myApp.factory('Settings', function() {
    // Load dependencies.
    var ipcRenderer = require('electron').ipcRenderer;
    
    // Initialize variables.
    var languages = {
        'destination': null,
        'source': null
    }
 
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
        
        setApiKey: function(name, value) {
            return ipcRenderer.sendSync('settings-set', {'name': ("api."+name), 'value': value });
        },
        
        getApiKey: function(name) {
            return ipcRenderer.sendSync('settings-get', 'api.' + name);
        }
    };

    // Return service.
    return service;
});

