// Service for manage the application's settings.
myApp.factory('Shared', [function () {
    var service = {};
    var ipcRenderer = require('electron').ipcRenderer;

    // --- Files and languages --- //

    // Define files variable.
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

    // Get list of languages.
    service.languages = ipcRenderer.sendSync('get-languages');

    // --- Store --- //

    // Initialize store with settings values.
    var storeValues = Object.assign({
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

    service.store = new SimpleObserver(storeValues);

    // Define methods for generate special values.
    var getEnabledLanguages = function() {
        var langs = [];

        for(var i=0; i<service.languages.length; i++) {
            var lang = service.languages[i];
            if(storeValues.disabledLanguages.indexOf(lang.code) < 0) {
                langs.push(lang);
            }
        }

        return langs;
    };

    var getEnabledEngines = function() {
        var enabled = [];
        var engines = ['yandex', 'microsoft'];

        for(var i=0; i<engines.length; i++) {
            var engineSetting = storeValues[engines[i]];
            if(engineSetting.enabled && engineSetting.token) {
                enabled.push(engines[i]);
            }
        }

        return enabled;
    };

    var getUsefulEngines = function() {
        var useful = [];
        var engines = getEnabledEngines();
        var fromLang = _.find(service.languages, function(lang) { return lang.code == storeValues.fromLang; });
        var toLang = _.find(service.languages, function(lang) { return lang.code == storeValues.toLang; });

        for(var i=0; i<engines.length; i++) {
            var engine = engines[i];
            if(fromLang && fromLang[engine] && toLang && toLang[engine]) {
                useful.push(engine);
            }
        }

        return useful;
    };

    // Initialize special values.
    storeValues.enabledLanguages = getEnabledLanguages();
    storeValues.enabledEngines = getEnabledEngines();
    storeValues.usefulEngines = getUsefulEngines();

    // Keep special values updated.
    service.store.watchAll(function(key) {
        if(key === 'disabledLanguages') {
            service.store.set('enabledLanguages', getEnabledLanguages());
        }

        if(key === 'yandex' || key === 'microsoft') {
            service.store.set('enabledEngines', getEnabledEngines());
            service.store.set('usefulEngines', getUsefulEngines());
        }

        if(key === 'fromLang' || key === 'toLang') {
            service.store.set('usefulEngines', getUsefulEngines());
        }
    });

    // Method for link store value to scope.
    service.linkStoreToScope = function(scope, sourceKey, targetKey) {
        if(!targetKey) { targetKey = sourceKey; }
        scope[targetKey] = storeValues[sourceKey];

        var updateTarget = function(key, newValue) { scope[targetKey] = newValue; };
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

    // --- Utilities --- //

    service.setLanguage = function(type, newValue) {
        var key = type == 'source' || type == 'from' || type == 'fromLang' ? 'fromLang' : 'toLang';
        service.store.set(key, newValue);
    };

    service.getLanguage = function(type) {
        var key = type == 'source' || type == 'from' || type == 'fromLang' ? 'fromLang' : 'toLang';
        return service.store.get(key);
    };

    service.getLanguageLocale = function(langCode) {
        var locale = null;

        var preferredLocales = service.store.get('languageLocales');
        if(preferredLocales && preferredLocales[langCode]) {
            locale = preferredLocales[langCode];
        } else {
            var language = _.find(service.languages, function(lang) { return lang.code === langCode; });
            if(language && language.spellcheck) {
                locale = language.spellcheck[0].locale;
            }
        }

        return locale;
    };

    return service;
}]);
