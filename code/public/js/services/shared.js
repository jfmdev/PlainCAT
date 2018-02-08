// Service for manage the application's settings.
myApp.factory('Shared', [function () {
    var service = {};
    var ipcRenderer = require('electron').ipcRenderer;

    // App's settings.
    service.settings = Object.assign({
        api_yandex: null,
        api_microsoft: null,
        file_source: null,
        file_target: null,
    }, ipcRenderer.sendSync('settings-get', 'app') || {});

    service.setSettingValue = function(name, value) {
        service.settings[name] = value;
        return ipcRenderer.sendSync('settings-set', {'name': ('app.' + name), 'value': value });
    };

    service.setApiKey = function(name, value) {
        return service.setSettingValue('api_' + name, value);
    };

    service.getApiKey = function(name) {
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
