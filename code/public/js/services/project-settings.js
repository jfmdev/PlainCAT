// Service for manage the project's settings.
// > NOTE: For now, project's settings will be stored on the settings.json file, along with the app's settings,
// > and will be shared among all projects, but eventually there will be one settings file per project.
myApp.factory('ProjectSettings', ['AppSettings', function (AppSettings) {
    var service = Object.assign({
        fromLangCode: 'en',
        toLangCode: 'es',
        translationEngine: 'yandex',
    }, AppSettings.getSetting('project') || {});

    service.setSetting = function(key, value) {
        service[key] = value;
        AppSettings.setSetting('project.' + key, value);
    };

    service.setLanguage = function(type, langCode) {
        service.setSetting((type === 'source' || type === 'from')? 'fromLangCode' : 'toLangCode', langCode);
    };

    service.setEngine = function(engineCode) {
        service.setSetting('translationEngine', engineCode);
    };

    return service;
}]);

