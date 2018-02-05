// Service for initialize the application's menu.
myApp.factory('Languages', ['ProjectSettings', function (ProjectSettings) {
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

    // Method for set a language (as either source or destination).
    service.setLang = function(type, language) {
        service.lang[type] = language;
        service.loadDictionary(language);
        ProjectSettings.setLanguage(type, language.code);
    };

    // TODO: Method for enable/disable a language.

    // TODO: Method for select a preferred locale.

    // Get last selected languages and load dictionaries.
    service.lang = {};
    for(var i=0; i<2; i++) {
        // Get language.
        var type = (i === 0)? 'source' : 'dest';
        var langCode = (i === 0)? ProjectSettings.fromLangCode : ProjectSettings.toLangCode;
        service.lang[type] = _.findWhere(service.list, {"code": langCode});

        // Load dictionary.
        service.loadDictionary(service.lang[type]);
    }

    return service;
}]);
