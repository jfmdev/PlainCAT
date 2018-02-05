// Service for translate text using Microsoft Translator.
myApp.factory('MicrosoftTranslator', ['AppSettings', function (AppSettings) {
    // Define service.
    var service = {};

    // Define private variables.
    service._microsoftToken = null;

    // Define private methods.
    service._getMicrosoftToken = function(done) {
        // Get suscription key.
        var suscriptionKey = service.getApiKey('microsoft');
        
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

    // Microsoft translation (requires subscription key).
    service.translate = function(fromLang, toLang, content, callback, tokenRequested) {
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
                        if(!tokenRequested) { 
                            service._getMicrosoftToken(tokenHandler); 
                        } else { 
                            callback(textStatus + " - " + errorThrown, null); 
                        }
                    }
                });
            } else {
                // Token is not defined. Try to obtain the token (unless the token was already recently requested) and try to translate again.
                if(!tokenRequested) { 
                    service._getMicrosoftToken(tokenHandler); 
                } else { 
                    callback('', null); 
                }
            }
        } else {
            // Return error.
            if(callback) {
                callback('', null);
            }
        }
    };

    // ----- Yandex ----- //

    // Yandex translation (requires API key).
    service.yandex = function(content, callback) {
        // Initialize variable.
        var apiKey = service.getApiKey('yandex');
        var lang = Languages.lang.source.code + "-" + Languages.lang.dest.code;

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
