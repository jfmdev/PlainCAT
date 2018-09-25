// Define controller.
myApp.controller('footerController', [
    '$scope', '$rootScope', 'Editor', 'Shared', 'Translator', '$uibModal', 
    function ($scope, $rootScope, Editor, Shared, Translator, $uibModal) {
        // Initialize variables.
        $scope.translation = null;
        $scope.sourceIndex = null;
        $scope.error = null;
        $scope.loading = false;

        Shared.linkStoreToScope($scope, 'enabledEngines');
        Shared.linkStoreToScope($scope, 'usefulEngines', 'availableEngines');
        Shared.linkStoreToScope($scope, 'selectedEngine', 'translationEngine');
        Shared.linkStoreToScope($scope, 'automaticTranslation');

        var translateText = function(index, content) {
            // Put loading message.
            $scope.loading = true;

            // Translate text.
            Translator.translate(content).then(function(result) {
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
            });
        }

        // When a paragraph is focused, update the translation.
        $scope.$on('paragraph-focused', function(event, data) {
            // Check if automatic translation is enabled.
            if($scope.automaticTranslation && $scope.availableEngines.length > 0) {
                // Translate text.
                var content = Editor.getParagraphContent('source', data.index);
                translateText(data.index, content);
                $scope.$apply();
            } else {
                // If the current translation is from another paragraph, delete it.
                if($scope.sourceIndex !== data.index) {
                    $scope.translation = null;
                    $scope.error = null;
                    $scope.$apply();
                }
            }

            // Update index.
            $scope.sourceIndex = data.index;
        });

        // Translate the source paragraph of the last selected row.
        $scope.translateNow = function() {
            var index = $scope.sourceIndex;
            var content = Editor.getParagraphContent('source', index);
            if(content) {
                translateText(index, content);
            }
        };
        $rootScope.$on('menu-translate', $scope.translateNow);

        // Paste the translation into the source paragraph.
        $scope.pasteTranslation = function() {
            $rootScope.$emit('paste-translation', { index: $scope.sourceIndex, text: $scope.translation });
            $scope.translation = null;
        };
        $rootScope.$on('menu-paste-translation', $scope.pasteTranslation);

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

        // Update the automatic translation.
        $scope.updateAutoTranslation = function(auto) {
            Shared.store.set('automaticTranslation', auto);
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
