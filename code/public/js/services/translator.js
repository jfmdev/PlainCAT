// Service for initialize the application's menu.
myApp.factory('Translator', [
    'Shared', 'YandexTranslator', 'MicrosoftTranslator', 
    function (Shared, YandexTranslator, MicrosoftTranslator) {
        var service = {};
        var ipcRenderer = require('electron').ipcRenderer;

        service.getTranslatorsList = function() {
            // Define list.
            var list = [
                { code: 'yandex', name: "Yandex" },
                { code: 'microsoft', name: "Microsoft" },
            ];

            // Check availability.
            for(var i=0; i<list.length; i++) {
                var apiData = Shared.getApiData(list[i].code)
                list[i].available = apiData && apiData.token && apiData.enabled;
            }

            return list;
        };

        service.getCachedTranslation = function(fromLang, toLang, engine, content) {
            return new Promise(function(resolve, reject) {
                ipcRenderer.once('cached-translation.got', function(sender, translation) {
                    if(translation) {
                        resolve(translation);
                    } else {
                        reject();
                    }
                });
                ipcRenderer.send('cached-translation.get', fromLang, toLang, engine, content); 
            });
        };

        service.getRemoteTranslation = function(fromLang, toLang, engine, content) {
            var promise;

            // Use engine's translator.
            if(engine === 'yandex') { 
                promise = YandexTranslator.translate(fromLang, toLang, content); 
            } else if(engine === 'microsoft') { 
                promise = MicrosoftTranslator.translate(fromLang, toLang, content); 
            } else { 
                promise = Promise.reject("Unsupported engine"); 
            }

            return promise.then(function(translation) {
                // Update cache before returning result.
                ipcRenderer.send('cached-translation.set', fromLang, toLang, engine, content, translation);
                return Promise.resolve(translation);
            });
        };

        service.translate = function(content) {
            // Initialize variables.
            var fromLang = Shared.project.fromLangCode;
            var toLang = Shared.project.toLangCode;
            var engine = Shared.project.translationEngine;

            // Check for cached translation and, if fails, get remote translation.
            return service.getCachedTranslation(fromLang, toLang, engine, content).catch(function() {
                return service.getRemoteTranslation(fromLang, toLang, engine, content);
            });
        };

        return service;
    }
]);
