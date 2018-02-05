// Service for manage the application's settings.
myApp.factory('AppSettings', [function () {
    var service = {};

    var ipcRenderer = require('electron').ipcRenderer;

    service.setSetting = function(name, value) {
        return ipcRenderer.sendSync('settings-set', {'name': (name), 'value': value });
    };
    service.getSetting = function(name) {
        return ipcRenderer.sendSync('settings-get', name);
    };

    service.setApiKey = function(name, value) {
        return service.setSetting('api.' + name, value);
    };
    service.getApiKey = function(name) {
        return service.getSetting('api.' + name);
    };

    return service;
}]);
