// Define controller.
myApp.controller('footerController', [
    '$scope', 'Shared', 'Translator', 
    function ($scope, Shared, Translator) {
        // Initialize variables.
        $scope.translation = null;
        $scope.error = null;
        $scope.loading = false;
        $scope.poweredBy = null;

        // When a paragraph is focused, update the automatic translation.
        $scope.$on('paragraph-focused', function(event, data) {
            // Put loading message.
            $scope.loading = true;
            $scope.$apply();

            // Translate text.
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
