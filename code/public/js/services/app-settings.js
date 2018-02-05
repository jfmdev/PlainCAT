// Service for manage the application's settings.
myApp.factory('AppSettings', [function () {
    var ipcRenderer = require('electron').ipcRenderer;
    var service = Object.assign({
        api_yandex: null,
        api_microsoft: null,
        file_source: null,
        file_destination: null,
    }, ipcRenderer.sendSync('settings-get', 'app') || {});

    service.setSetting = function(name, value) {
        service[name] = value;
        return ipcRenderer.sendSync('settings-set', {'name': ('app.' + name), 'value': value });
    };

    service.setApiKey = function(name, value) {
        return service.setSetting('api_' + name, value);
    };

    service.getApiKey = function(name) {
        return service['api_' + name];
    };

    return service;
}]);
