// Service for initialize the application's menu.
myApp.factory('Languages', [function () {
    // Load dependencies.
    var ipcRenderer = require('electron').ipcRenderer;
    
    // Define service.
    var service = {};
        
    // Initialize list of languages.
    service.list = ipcRenderer.sendSync('get-languages');
    
    // Method for get the prefered locale of a language.
    service.getLangLocale = function(language) {
        // TODO: Verify preferred locale.
        var locale = null;
        if(language && language.spellcheck) {
            locale = language.spellcheck[0].locale;
        }
        return locale;
    };

    // Method for load a dictionary (for the spellchecker).
    service.loadDictionary = function(language) {
        var locale = service.getLangLocale(language);
        if(locale) {
            ipcRenderer.send('dictionary.load', locale);
        }          
    };
    
    // Method for set a language as either source or destination.
    service.setLang = function(type, language) {
        service.lang[type] = language;
        service.loadDictionary(language);
        ipcRenderer.sendSync('settings-set', {'name': ("lang."+type), 'value': language.code })
    };

    // TODO: Method for enable/disable a language -> should be on app settings
    
    // TODO: Method for select a preferred locale -> should be on app settings
    
    // Get last selected languages and load dictionaries -> should be on project settings.
    service.lang = {};
    for(var i=0; i<2; i++) {
        // Get language.
        var type = i==0? 'source' : 'dest';
        var langCode = ipcRenderer.sendSync('settings-get', 'lang.' + type) || (i==0? 'en' : 'es');
        service.lang[type] = _.findWhere(service.list, {"code": langCode});
      
        // Load dictionary.
        service.loadDictionary(service.lang[type]);
    }
    
    // Return service.
    return service;
}]);

