// Service for translate text using Microsoft Translator.
myApp.factory('MicrosoftTranslator', ['Shared', function (Shared) {
    // Define service.
    var service = {};

    // Define private variables.
    service._microsoftToken = null;

    // Define private methods.
    service._getMicrosoftToken = function(callback) {
        // Get suscription key.
        var apiData = Shared.store.get('microsoft');
        var suscriptionKey = apiData ? apiData.token : null;

        // Verify that the key was defined.
        if(suscriptionKey) {
            $.ajax({
                type: "POST",
                url: "https://api.cognitive.microsoft.com/sts/v1.0/issueToken?Subscription-Key=" + suscriptionKey
            }).done(function (token) {
                // Save token and return success.
                service._microsoftToken = token;
                callback(true);
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                // Return failure.
                callback(false);
            });
        } else {
            // Return failure.
            callback(false);
        }
    };

    // Microsoft translation (requires subscription key).
    service.translate = function(fromLang, toLang, content, tokenRequested) {
        return new Promise(function(resolve, reject) {
            // Validate parameters.
            if(content) {
                // Define callback for token getter method.
                var tokenHandler = function(success) {
                    // Verify if token could be obtained.
                    if(success) {
                        // Try again to translate.
                        return service.translate(fromLang, toLang, content, true);
                    } else {
                        // Return error.
                        reject("Operation couldn't be completed");
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
                            resolve(translation)
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            // Call failed. Perhaps the token was expired, try to obtain another token (unless it was recently obtained) and try again. Otherwise return an error message.
                            if(!tokenRequested) { 
                                service._getMicrosoftToken(tokenHandler); 
                            } else { 
                                reject(textStatus + " - " + errorThrown); 
                            }
                        }
                    });
                } else {
                    // Token is not defined. Try to obtain the token (unless it was recently requested) and try to translate again. Otherwise return an error message.
                    if(!tokenRequested) { 
                        service._getMicrosoftToken(tokenHandler); 
                    } else { 
                        reject("Operation couldn't be completed");
                    }
                }
            } else {
                // Return empty string.
                resolve('');
            }
        });
    };

    // Return service.
    return service;
}]);
