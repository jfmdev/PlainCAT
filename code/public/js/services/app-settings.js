// Service for manage the application's settings.
myApp.factory('AppSettings', [function () {
    // Load dependencies.
    var ipcRenderer = require('electron').ipcRenderer;

    // Define service.
    var service = {};

    // Main get/set methods.
    service.setSetting = function(name, value) {
        return ipcRenderer.sendSync('settings-set', {'name': (name), 'value': value });
    };
    service.getSetting = function(name) {
        return ipcRenderer.sendSync('settings-get', name);
    };

    // API keys related get/set methods.
    service.setApiKey = function(name, value) {
        return ipcRenderer.sendSync('settings-set', {'name': ("api."+name), 'value': value });
    };
    service.getApiKey = function(name) {
        return ipcRenderer.sendSync('settings-get', 'api.' + name);
    };

    // Return service.
    return service;
}]);

