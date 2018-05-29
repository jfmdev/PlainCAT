// Define controller.
myApp.controller('footerController', [
    '$scope', '$rootScope', 'Shared', 'Translator', 
    function ($scope, $rootScope, Shared, Translator) {
        // Initialize variables.
        $scope.translation = null;
        $scope.sourceIndex = null;
        $scope.error = null;
        $scope.loading = false;
        $scope.poweredBy = null;

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
                $scope.poweredBy = $scope.error? null : Shared.project.translationEngine;
                $scope.loading = false;
                $scope.$apply();
            });;
        });

        // Paste the translation into the source paragraph.
        $scope.pasteTranslation = function(translation) {
            $rootScope.$emit('paste-translation', { index: $scope.sourceIndex, text: translation });
        };

        $scope.openTranslationSettings = function() {
            alert('Feature not implemented');
        };

        // TODO: should listen for changes on 
        // - Shared.project.translationEngine
        // And disable translation and hide bar if disabled 
        // (and show a tiny message: Automatic translation disabled, or something like that).
        // $scope.enable = true;

        // TODO: should listen for changes on 
        // - Shared.project.fromLangCode
        // - Shared.project.toLangCode
        // - Shared.project.translationEngine
        // And, if incompatible, disable the translation and hide the translation bar
        // (and show a tiny message: These languages are not supported by Yandex/Microsoft, or something like that)
        // $scope.incompatibleLanguages = false;

        // TODO: should listen for changes on 
        // - Shared.project.translationEngine
        // - Shared.settings.app_....
        // And, if not configured, disable the translation and hide the translation bar
        // (and show a tiny message: You need to set up your Yandex/Microsoft API Key for automatic translations, or something like that)
        // $scope.incompatibleLanguages = false;
    }
]);
