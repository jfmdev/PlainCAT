// Define controller.
myApp.controller('bodyController', [
    '$scope', 'toastr', 'Shared', 'Menu', 'Editor', 'FileManager', 
    function ($scope, toastr, Shared, Menu, Editor, FileManager) {
        // Initialize variables.
        $scope.files = Shared.files;

        // Update editors when the content is updated.
        $scope.$watch('files.source', function() {
            Editor.initialize('source', '#source-file', '#target-file', $scope.files.source.content || []);
        });
        $scope.$watch('files.target', function() {
            Editor.initialize('target', '#target-file', '#source-file', $scope.files.target.content || []);
        });

        // Open a file picker.
        $scope.openFile = FileManager.openFile;

        // Copy the source's content into the target.
        $scope.copySource = FileManager.copySource;
    }
]);
