// Define controller.
myApp.controller('bodyController', [
    '$scope', 'toastr', 'Shared', 'Menu', 'Editor', 'FileManager', 
    function ($scope, toastr, Shared, Menu, Editor, FileManager) {
        // Initialize variables.
        $scope.files = Shared.files;
        Editor.initialize('#files-content');

        // Get last files.
        Shared.linkStoreToScope($scope, 'sourceFile', 'lastSourceFile');
        Shared.linkStoreToScope($scope, 'targetFile', 'lastTargetFile');

        // Update editors when the content is updated.
        $scope.$watch('files.source', function() {
            Editor.loadContent('source', $scope.files.source.content);
        });
        $scope.$watch('files.target', function() {
            Editor.loadContent('target', $scope.files.target.content);
        });

        // Open a file picker.
        $scope.openFile = FileManager.openFile;

        // Read and load a file.
        $scope.readFile = FileManager.readFile;

        // Copy the source's content into the target.
        $scope.copySource = FileManager.copySource;
    }
]);
