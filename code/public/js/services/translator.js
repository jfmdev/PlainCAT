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

        service.translate = function(content, callback) {
            // Initialize variables.
            var fromLang = 'en'; // TODO: read from project settings.
            var toLang = 'en'; // TODO: read from project settings.
            var engine = 'yandex'; // TODO: read from project settings.

            // Call translator.
            if(engine === 'yandex') { YandexTranslator.translate(fromLang, toLang, content, callback); }
            else if(engine === 'microsoft') { MicrosoftTranslator.translate(fromLang, toLang, content, callback); }
            else { callback("Unsupported engine", null); }
        };

        // Return service.
        return service;
    }
]);
