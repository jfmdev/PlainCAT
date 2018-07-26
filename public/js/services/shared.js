// Service for manage the application's settings.
myApp.factory('Shared', [function () {
    var service = {};
    var ipcRenderer = require('electron').ipcRenderer;

    // Get list of languages.
    service.languages = ipcRenderer.sendSync('get-languages');

    // Initialize setting values.
    var settingValues = Object.assign({
        fromLang: 'en',
        toLang: 'es',
        selectedEngine: 'yandex',

        sourceFile: null,
        targetFile: null,

        yandex: { enabled: true, token: null },
        microsoft: { enabled: true, token: null },

        disabledLanguages: [],
        languageLocales: {},
    }, ipcRenderer.sendSync('settings-get', 'app') || {});

    // Initialize store.
    service.store = new SimpleObserver(settingValues);

    // Define methods for generate special values.
    var getEnabledLanguages = function() {
        var langs = [];

        for(var i=0; i<service.languages.length; i++) {
            var lang = service.languages[i];
            if(settingValues.disabledLanguages.indexOf(lang.code) < 0) {
                langs.push(lang);
            }
        }

        return langs;
    };

    var getEnabledEngines = function() {
        var enabled = [];
        var engines = ['yandex', 'microsoft'];

        for(var i=0; i<engines.length; i++) {
            var engineSetting = settingValues[engines[i]];
            if(engineSetting.enabled && engineSetting.token) {
                enabled.push(engines[i]);
            }
        }

        return enabled;
    };

    var getUsefulEngines = function() {
        var useful = [];
        var engines = getEnabledEngines();
        var fromLang = _.find(service.languages, function(lang) { return lang.code == settingValues.fromLang; });
        var toLang = _.find(service.languages, function(lang) { return lang.code == settingValues.toLang; });

        for(var i=0; i<engines.length; i++) {
            var engine = engines[i];
            if(fromLang && fromLang[engine] && toLang && toLang[engine]) {
                useful.push(engine);
            }
        }

        return useful;
    };

    // Initialize special values.
    settingValues.enabledLanguages = getEnabledLanguages();
    settingValues.enabledEngines = getEnabledEngines();
    settingValues.usefulEngines = getUsefulEngines();

    // Keep special values updated.
    service.store.watchAll(function(key) {
        if(key === 'disabledLanguages') {
            service.store.set('enabledLanguages', getEnabledLanguages());
        }

        if(key === 'yandex' || key === 'microsoft') {
            service.store.set('enabledEngines', getEnabledEngines());

            if(key === 'fromLang' || key === 'toLang') {
                service.store.set('usefulEngines', getUsefulEngines());
            }
        }
    });

    // Method for link store value to scope.
    service.linkStore = function(scope, target, sourceKey, targetKey) {
        target[targetKey] = settingValues[sourceKey];

        var updateTarget = function(key, newValue) { target[targetKey] = newValue; };
        var unwatch = service.store.watch(sourceKey, updateTarget);

        scope.$on('$destroy', unwatch);
    };

    // Update settings file after a change.
    service.store.watchAll(function(key, newValue) {
        // Don't save special values.
        if(key != 'disabledLanguages' && key != 'enabledEngines' && key != 'usefulEngines') {
            return ipcRenderer.sendSync('settings-set', {'name': ('app.' + key), 'value': newValue });
        }
    });

    // Utility functions.
    service.setLanguage = function(type, newValue) {
        var key = type == 'source' || type == 'from' || type == 'fromLang' ? 'fromLang' : 'toLang';
        service.store.set(key, newValue);
    };

    // --- Files --- //

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
