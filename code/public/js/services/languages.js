// Service for initialize the application's menu.
myApp.factory('Languages', ['Shared', function (Shared) {
    var service = {};
    var ipcRenderer = require('electron').ipcRenderer;

    // Initialize list of languages.
    service.list = ipcRenderer.sendSync('get-languages');

    // Method for get the prefered locale of a language.
    service.getLangLocale = function(language) {
        // TODO: Verify preferred locale (for now the first locale is selected by default).
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

    // Method for set a language (as either source or target).
    service.setLang = function(type, language) {
        service.lang[type] = language;
        service.loadDictionary(language);
        Shared.setLanguage(type, language.code);
    };

    // TODO: Method for enable/disable a language.
    // Should update on service.list and on Shared.settings.

    // TODO: Method for select a preferred locale.
    // Should update on service.list and on Shared.settings.

    // Get last selected languages and load dictionaries.
    service.lang = {};
    for(var i=0; i<2; i++) {
        // Get language.
        var type = (i === 0)? 'source' : 'dest';
        var langCode = (i === 0)? Shared.project.fromLangCode : Shared.project.toLangCode;
        service.lang[type] = _.findWhere(service.list, {"code": langCode});

        // Load dictionary.
        service.loadDictionary(service.lang[type]);
    }

    return service;
}]);
