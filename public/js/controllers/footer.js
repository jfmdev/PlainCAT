// Define controller.
myApp.controller('footerController', [
    '$scope', '$rootScope', 'Shared', 'Translator', '$uibModal', 
    function ($scope, $rootScope, Shared, Translator, $uibModal) {
        // Initialize variables.
        $scope.translation = null;
        $scope.sourceIndex = null;
        $scope.error = null;
        $scope.loading = false;

        Shared.linkStoreToScope($scope, 'enabledEngines');
        Shared.linkStoreToScope($scope, 'usefulEngines', 'availableEngines');
        Shared.linkStoreToScope($scope, 'selectedEngine', 'translationEngine');

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
            Shared.store.set('selectedEngine', engine);
        };

        // Set default values to engine if the list is updated.
        var unwatchEngines = Shared.store.watch('usefulEngines', function(key, engines) {
            if(engines.length > 0) {
                if(!$scope.translationEngine || !_.find(engines, function(engine) { return engine === $scope.translationEngine; })) {
                    $scope.updateEngine(engines[0]);
                }
            } else {
                $scope.updateEngine(null);
            }
        });
    }
]);