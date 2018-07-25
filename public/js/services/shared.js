// Service for manage the application's settings.
myApp.factory('Shared', ['$rootScope', function ($rootScope) {
    var service = {};
    var ipcRenderer = require('electron').ipcRenderer;

    // App's settings.
    service.settings = Object.assign({
        file_source: null,
        file_target: null,
        api_yandex: { enabled: true, token: null },
        api_microsoft: { enabled: true, token: null },
        languages: { disabled: [], locales: {} },
    }, ipcRenderer.sendSync('settings-get', 'app') || {});

    service.isLanguageEnabled = function(langCode) {
        return service.settings.languages.disabled.indexOf(langCode) < 0;
    };

    service.setSettingValue = function(name, value) {
        service.settings[name] = value;
        $rootScope.$emit('settings-updated', { 'name': name });
        return ipcRenderer.sendSync('settings-set', {'name': ('app.' + name), 'value': value });
    };

    service.setApiData = function(name, value) {
        return service.setSettingValue('api_' + name, value);
    };

    service.getApiData = function(name) {
        return service.settings['api_' + name];
    };

    // Project's settings.
    service.project = Object.assign({
        fromLangCode: 'en',
        toLangCode: 'es',
        translationEngine: 'yandex',
    }, ipcRenderer.sendSync('settings-get', 'project') || {});

    service.setProjectValue = function(name, value) {
        service.project[name] = value;
        ipcRenderer.sendSync('settings-set', {'name': ('project.' + name), 'value': value });
    };

    service.setLanguage = function(type, langCode) {
        var langKey = (type === 'source' || type === 'from')? 'fromLangCode' : 'toLangCode';
        service.setProjectValue(langKey, langCode);
    };

    service.setEngine = function(engineCode) {
        service.setProjectValue('translationEngine', engineCode);
    };

    // File's data.
    service.files = {
        source: {
            name: null,
            path: null,
            content: null,
            dirty: false,
            encoding: 'UTF-8',
        },
        target: {
            name: null,
            path: null,
            content: null,
            dirty: false,
            encoding: 'UTF-8',
        },
    };

    return service;
}]);
