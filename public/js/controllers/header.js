// Define controller.
myApp.controller('headerController', [
    '$scope', '$rootScope', 'Shared', 'FileManager',
    function ($scope, $rootScope, Shared, FileManager) {
        // Initialize variables.
        $scope.files = Shared.files;

        Shared.linkStoreToScope($scope, 'fromLang', 'sourceLang');
        Shared.linkStoreToScope($scope, 'toLang', 'targetLang');
        Shared.linkStoreToScope($scope, 'enabledLanguages', 'mainLanguages');

        // File actions.
        $scope.closeFile = FileManager.closeFile;
        $scope.openFile = FileManager.openFile;
        $scope.saveFile = FileManager.saveFile;
        $scope.saveFileAs = FileManager.saveFileAs;

        // Copy the source's content into the target.
        $scope.copySource = FileManager.copySource;

        // Update language in settings when changing a combo box.
        $scope.languageSelected = function(type, newValue) {
            Shared.setLanguage(type, newValue);
        };

        // Remove extension from file name.
        $scope.removeExtension = function(fileName) {
            return (fileName || '').replace(/\.[^/.]+$/, "");
        };
    }
]);
