// Service for initialize the application's menu.
myApp.factory('Translator', ['Settings', function (Settings) {
    // Define service.
    var service = {
        yandex: function(content, callback) {
            // Initialize variable.
            var apiKey = Settings.getApiKey('yandex');     
            var lang = Settings.getLanguageCode('source') + "-" + Settings.getLanguageCode('destination');
            
            // Validate parameters.
            if(content && apiKey && callback) {
                $.ajax({
                    dataType: "json",
                    url: "https://translate.yandex.net/api/v1.5/tr.json/translate",
                    data: {'key': apiKey, 'lang': lang, 'text': content},
                    success: function(data) {    
                        // Return translation.
                        callback(null, data.text)
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
        },
    };

    // Return service.
    return service;
}]);

