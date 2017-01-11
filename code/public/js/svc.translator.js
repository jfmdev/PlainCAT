// Service for initialize the application's menu.
myApp.factory('Translator', ['Settings', function (Settings) {  
    // Define service.
    var service = {};
    
    // Define private variables.
    service._microsoftToken = null;

    // Define private methods.
    service._getMicrosoftToken = function(done) {
        // Get suscription key.
        var suscriptionKey = Settings.getApiKey('microsoft');
        
        // Verify that the key was defined.
        if(suscriptionKey) {
            $.ajax({
                type: "POST",
                url: "https://api.cognitive.microsoft.com/sts/v1.0/issueToken?Subscription-Key=" + suscriptionKey
            }).done(function (token) {
                // Save token and return success.
                service._microsoftToken = token;
                if(done) done(true);
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                // Return failure.
                if(done) done(false);
            });
        } else {
            // Return failure.
            if(done) done(false)
        }
    };
    
    // Yandex translation (requires API key).
    service.yandex = function(content, callback) {
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
    
    // Translt translation.
    service.translt = function(content, callback) {
        // Validate parameters.
        if(content && callback) {
            // Initialize variables.
            var fromLang = Settings.getLanguageCode('source');
            var toLang = Settings.getLanguageCode('destination');
          
            // Consume API.
            $.ajax({
                dataType: "json",
                url: "http://www.transltr.org/api/translate",
                data: {
                    'from': fromLang, 
                    'to': toLang, 
                    'text': content
                },
                success: function(data) {
                    // Return translation.
                    callback(null, data.translationText)
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
    
    // Microsoft translation (requires subscription key).
    service.microsoft = function(content, callback, tokenRequested) {
        // Validate parameters.
        if(content && callback) {
            // Define callback for token getter method.
            var tokenHandler = function(success) {
                // Verify if token could be obtained.
                if(success) {
                    // Try again to translate.
                    service.microsoft(content, callback, true);
                } else {
                    // Return error.
                    if(callback) callback('', null);
                }
            };
          
            // Verify if token is defined.
            if(service._microsoftToken) {
                // Initialize variables.
                var fromLang = Settings.getLanguageCode('source');
                var toLang = Settings.getLanguageCode('destination');
                var authToken = "Bearer " + service._microsoftToken;
                var restUrl = "http://api.microsofttranslator.com/v2/Http.svc/Translate?appid=" + encodeURI(authToken) + "&text=" + encodeURI(content) + "&from=" + fromLang + "&to=" + toLang + "&contentType=text%2Fplain&category=general";
                
                // Consume API.
                $.ajax({
                    type: "GET",
                    url: restUrl,
                    success: function(xmlResult) {
                        // Parse response.
                        var stringNode = xmlResult.getElementsByTagName("string")[0];
                        var firstChild = stringNode.childNodes[0];
                        var translation = firstChild.nodeValue;
                        // Return translation.
                        callback(null, translation)
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        // Call failed. Perhaps the token was expired, so try to obtain another token (unless the token was recently obtained) and try to translate again. Otherwise return an error message.
                        if(!tokenRequested) { service._getMicrosoftToken(tokenHandler); } else { callback(textStatus + " - " + errorThrown, null); }
                    }
                });
            } else {
                // Token is not defined. Try to obtain the token (unless the token was already recently requested) and try to translate again.
                if(!tokenRequested) { service._getMicrosoftToken(tokenHandler); } else { callback('', null); }
            }
        } else {
            // Return error.
            if(callback) callback('', null);
        }
    };

    // Return service.
    return service;
}]);

