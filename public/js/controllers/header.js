// Define controller.
myApp.controller('headerController', [
    '$scope', 'Shared', 'Languages', 'FileManager',
    function ($scope, Shared, Languages, FileManager) {
        // Initialize variables.
        $scope.mainLanguages = Languages.list;
        $scope.sourceLang = Languages.lang.source;
        $scope.targetLang = Languages.lang.target;
        $scope.files = Shared.files;

        // Close a file.
        $scope.closeFile = FileManager.closeFile;

        // Open a file.
        $scope.openFile = FileManager.openFile;

        // Save a file.
        $scope.saveFile = FileManager.saveFile;

        // Save a file with a new name.
        $scope.saveFileAs = FileManager.saveFileAs;

        // Copy the source's content into the target.
        $scope.copySource = FileManager.copySource;

        // Update language in settings when changing a combo box.
        $scope.languageSelected = function(type, newValue) {
            Languages.setLang(type, newValue);
        };

        // Remove extension from file name.
        $scope.removeExtension = function(fileName) {
            return (fileName || '').replace(/\.[^/.]+$/, "");
        };
    }
]);
