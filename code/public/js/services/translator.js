// Service for initialize the application's menu.
myApp.factory('Translator', [
    'AppSettings', 'ProjectSettings', 'YandexTranslator', 'MicrosoftTranslator', 
    function (AppSettings, ProjectSettings, YandexTranslator, MicrosoftTranslator) {
        // Define service.
        var service = {};

        // Define methods

        service.getTranslatorsList = function() {
            return [
                { code: 'yandex', name: "Yandex", available: (AppSettings.getApiKey('yandex') != null) },
                { code: 'microsoft', name: "Microsoft", available: (AppSettings.getApiKey('microsoft') != null) },
            ];
        };

        service.translate = function(content) {
            // Initialize variables.
            var fromLang = 'en'; // TODO: read from project settings.
            var toLang = 'en'; // TODO: read from project settings.
            var engine = 'yandex'; // TODO: read from project settings.

            // Call translator.
            if(engine === 'yandex') { return YandexTranslator.translate(fromLang, toLang, content); }
            else if(engine === 'microsoft') { return MicrosoftTranslator.translate(fromLang, toLang, content); }
            else { throw new Error("Unsupported engine"); }
        };

        // Return service.
        return service;
    }
]);
