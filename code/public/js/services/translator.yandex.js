// Service for translate text using Yandex Translator.
myApp.factory('YandexTranslator', ['AppSettings', function (AppSettings) {
    // Define service.
    var service = {};

    // Yandex translation (requires API key).
    service.translate = function(fromLang, toLang, content, callback) {
        // Initialize variables.
        var apiKey = AppSettings.getApiKey('yandex');
        var lang = fromLang + "-" + toLang;

        // Validate parameters.
        if(content && apiKey && callback) {
            $.ajax({
                dataType: "json",
                url: "https://translate.yandex.net/api/v1.5/tr.json/translate",
                data: {'key': apiKey, 'lang': lang, 'text': content},
                success: function(data) {    
                    // Return translation.
                    var result = data.text;
                    callback(null, result.length? result[0] : result);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    // Return error message.
                    callback(textStatus + " - " + errorThrown, null);
                }
            });
        } else {
            // Return error.
            if(callback) callback('', null);
        }
    };

    // Return service.
    return service;
}]);
