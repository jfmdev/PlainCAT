// Service for translate text using Yandex Translator.
myApp.factory('YandexTranslator', ['Shared', function (Shared) {
    // Define service.
    var service = {};

    // Yandex translation (requires API key).
    service.translate = function(fromLang, toLang, content) {
        return new Promise(function(resolve, reject) {
            // Initialize variables.
            var apiKey = Shared.getApiKey('yandex');
            var lang = fromLang + "-" + toLang;

            // Validate parameters.
            if(content && apiKey) {
                $.ajax({
                    dataType: "json",
                    url: "https://translate.yandex.net/api/v1.5/tr.json/translate",
                    data: {'key': apiKey, 'lang': lang, 'text': content},
                    success: function(data) {    
                        // Return translation.
                        var result = data.text;
                        resolve(result.length? result[0] : result);
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        // Return error message.
                        reject(textStatus + " - " + errorThrown);
                    }
                });
            } else {
                // Return error.
                reject("Operation couldn't be completed");
            }
        });
    };

    // Return service.
    return service;
}]);
