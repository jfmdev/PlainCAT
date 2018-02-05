// Define controller.
myApp.controller('footerController', ['$scope', 'Translator', function ($scope, Translator) {
    // Initialize variables.
    $scope.translation = null;
    $scope.error = null;
    $scope.loading = false;

    // When a paragraph is focused, update the automatic translation.
    $scope.$on('paragraph-focused', function(event, data) {
        // Put loading message.
        $scope.loading = true;
        $scope.$apply();

        // Translate text.
        Translator.translate(data.content, function(error, result) {
            // Update variables and UI.
            $scope.loading = false;
            $scope.error = error;
            $scope.translation = result;
            $scope.$apply();
        });
    });
}]);