// Service for initialize the application's menu.
myApp.factory('Translator', [
    'AppSettings', 'ProjectSettings', 'YandexTranslator', 'MicrosoftTranslator', 
    function (AppSettings, ProjectSettings, YandexTranslator, MicrosoftTranslator) {
        var service = {};

        service.getTranslatorsList = function() {
            return [
                { code: 'yandex', name: "Yandex", available: (AppSettings.getApiKey('yandex') != null) },
                { code: 'microsoft', name: "Microsoft", available: (AppSettings.getApiKey('microsoft') != null) },
            ];
        };

        service.translate = function(content) {
            // Initialize variables.
            var fromLang = ProjectSettings.fromLangCode;
            var toLang = ProjectSettings.toLangCode;
            var engine = ProjectSettings.translationEngine;

            // TODO: Implement cache for prevent doing the same translation (i.e. same langs, text and engine) twice.

            // Call translator.
            if(engine === 'yandex') { return YandexTranslator.translate(fromLang, toLang, content); }
            else if(engine === 'microsoft') { return MicrosoftTranslator.translate(fromLang, toLang, content); }
            else { throw new Error("Unsupported engine"); }
        };

        return service;
    }
]);
