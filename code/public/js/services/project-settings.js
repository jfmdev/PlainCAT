// Service for manage the project's settings.
// > NOTE: For now, project's settings will be stored on the settings.json file, along with the app's settings,
// > and will be shared among all projects, but eventually there will be one settings file per project.
myApp.factory('ProjectSettings', [function () {
    var ipcRenderer = require('electron').ipcRenderer;
    var service = Object.assign({
        fromLangCode: 'en',
        toLangCode: 'es',
        translationEngine: 'yandex',
    }, ipcRenderer.sendSync('settings-get', 'project') || {});

    service.setSetting = function(key, value) {
        service[key] = value;
        ipcRenderer.sendSync('settings-set', {'name': ('project.' + key), 'value': value });
    };

    service.setLanguage = function(type, langCode) {
        var langKey = (type === 'source' || type === 'from')? 'fromLangCode' : 'toLangCode';
        service.setSetting(langKey, langCode);
    };

    service.setEngine = function(engineCode) {
        service.setSetting('translationEngine', engineCode);
    };

    return service;
}]);

