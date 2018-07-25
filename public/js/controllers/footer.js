// Define controller.
myApp.controller('footerController', [
    '$scope', '$rootScope', 'Shared', 'Translator', 'Languages', '$uibModal', 
    function ($scope, $rootScope, Shared, Translator, Languages, $uibModal) {
        // Initialize variables.
        $scope.translation = null;
        $scope.sourceIndex = null;
        $scope.error = null;
        $scope.loading = false;

        $scope.settings = Shared.settings;
        $scope.project = Shared.project;
        $scope.enabledEngines = [];
        $scope.availableEngines = [];

        // When a paragraph is focused, update the automatic translation.
        $scope.$on('paragraph-focused', function(event, data) {
            // Put loading message.
            $scope.loading = true;
            $scope.$apply();

            // Translate text.
            $scope.sourceIndex = data.index;
            Translator.translate(data.content).then(function(result) {
                // Set translation.
                $scope.error = null;
                $scope.translation = result;
            }).catch(function(error) {
                // Set error.
                $scope.error = error;
                $scope.translation = null;
            }).finally(function() {
                // Update flag and refresh UI.
                $scope.loading = false;
                $scope.$apply();
            });;
        });

        // Paste the translation into the source paragraph.
        $scope.pasteTranslation = function(translation) {
            $rootScope.$emit('paste-translation', { index: $scope.sourceIndex, text: translation });
        };

        // Open Settings dialog on the Translation tab.
        $scope.openTranslationSettings = function() {
            var modalInstance = $uibModal.open({
                templateUrl: 'views/settings.html',
                controller: 'settingsController',
                size: 'lg',
                resolve: {
                    tab: function () { return 'language'; }
                }
            });
        };

        // Update the translation engine.
        $scope.updateEngine = function(engine) {
            Shared.setEngine(engine);
        };
        
        // Keep updated the list of enabled engines.
        $scope.$watchGroup([
            'settings.api_yandex.enabled', 'settings.api_yandex.token',
            'settings.api_microsoft.enabled', 'settings.api_microsoft.token',
        ], function() {
            var engines = [];
            if($scope.settings.api_yandex.enabled && $scope.settings.api_yandex.token) { engines.push('yandex'); }
            if($scope.settings.api_microsoft.enabled && $scope.settings.api_microsoft.token) { engines.push('microsoft'); }
            $scope.enabledEngines = engines;
        });

        // Keep updated the list of available engines (for current languages).
        $scope.$watchGroup(['enabledEngines', 'project.fromLangCode', 'project.toLangCode'], function() {
            var engines = [];
            var fromLang = _.find(Languages.list, function(lang) { return lang.code == Shared.project.fromLangCode; });
            var toLang = _.find(Languages.list, function(lang) { return lang.code == Shared.project.toLangCode; });
            for(var i=0; i<$scope.enabledEngines.length; i++) {
                var engine = $scope.enabledEngines[i];
                if(fromLang && fromLang[engine] && toLang && toLang[engine]) {
                    engines.push(engine);
                }
            }
            $scope.availableEngines = engines;

            // Update current engine.
            if(engines.length > 0) {
                if(!$scope.project.translationEngine || !_.find(engines, function(engine) { return engine === $scope.project.translationEngine; })) {
                    $scope.project.translationEngine = engines[0];
                }
            } else {
                $scope.project.translationEngine = null;
            }
        });
    }
]);
