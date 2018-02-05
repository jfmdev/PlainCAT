// Define controller.
myApp.controller('footerController', ['$scope', 'Translator', function ($scope, Translator) {
    // Initialize variables.
    $scope.translation = null;
    $scope.error = null;
    $scope.loading = false;
Translator.setApiKey('yandex', "trnsl.1.1.20160811T160058Z.6c6d13f0aa16c162.086d25e70d16dad8f909bae3a3f6cd85004262e2");
Translator.setApiKey('microsoft', "4fa9c16bf2b84f5d8d25965d40d3eaf3");

    // When a paragraph is focused, update the automatic translation.
    $scope.$on('paragraph-focused', function(event, data) {
        // Put loading message.
        $scope.loading = true;
        $scope.$apply();

        // TODO: Verify which provider is currently selected.
        // Translate text.
        // Translator.translt(data.content, function(error, result) {
            // // Update variables and UI.
            // $scope.loading = false;
            // $scope.error = error;
            // $scope.translation = result;
            // $scope.$apply();
            
            // // TODO: emit an event indicating that a new translation is available?
        // });
        Translator.yandex(data.content, function(result, error) {
            console.log("yandex", result, error, data.content);
        });
        // Translator.microsoft(data.content, function(error, result) {
            // console.log("microsoft", result, error);
        // });
    });
}]);
