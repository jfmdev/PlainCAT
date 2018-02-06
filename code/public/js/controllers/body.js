// Define controller.
myApp.controller('bodyController', [
    '$scope', 'Shared', 'Menu', 'Editor', 'toastr', 
    function ($scope, Shared, Menu, Editor, toastr) {
        // Initialize variables.
        $scope.files = Shared.files;

        // ----- Files ----- //

        // Update editors when the content is updated.
        $scope.$watch('files.source', function() {
            Editor.initialize('source', '#source-file', '#target-file', $scope.files.source.content || []);
        });
        $scope.$watch('files.target', function() {
            Editor.initialize('target', '#target-file', '#source-file', $scope.files.target.content || []);
        });

        // Copy the source's content into the target.
        $scope.copySource = function() {
            var lines = Editor.getContent('#source-file');
            var content = [];
            for(var i=0; i<lines.length; i++) {
                content.push({
                    'index': (i>0? (content[i-1].index + lines[i-1].length) : 0),
                    'text': lines[i]
                })
            }

            // Update target (this will trigger the editor's initialization via the watcher)
            $scope.files.target = {
                dirty: true,
                name: null,
                path: null,
                content: content,
            };
        };
    }
]);
