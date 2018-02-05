// Service for manage the project's settings.
// > NOTE: For now, project's settings will be stored on the settings.json file, along with the app's settings,
// > and will be shared among all projects, but eventually there will be one settings file per project.
myApp.factory('ProjectSettings', ['AppSettings', function (AppSettings) {
    // Define service.
    var service = {};

    // Load default values.
    service = Object.assign(service, AppSettings.getSetting("defaultProjectSettings") || {});

    // Return service.
    return service;
}]);

