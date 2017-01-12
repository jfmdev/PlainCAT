// Define controller.
myApp.controller('headerController', ['$scope', 'Languages', function ($scope, Languages) {
    // Initialize variables.
    $scope.mainLanguages = Languages.list;
    $scope.sourceLang = Languages.lang.source;
    $scope.destLang = Languages.lang.dest;

    // Update language in settings when changing a combo box.
    $scope.languageSelected = function(type, newValue) {
        Languages.setLang(type, newValue);
    };
}]);
