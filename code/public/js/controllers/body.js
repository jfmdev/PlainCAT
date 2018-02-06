// Define controller.
myApp.controller('bodyController', [
    '$scope', 'Shared', 'Menu', 'Editor', 'Translator', 'Spellchecker', 'toastr', 
    function ($scope, Shared, Menu, Editor, Translator, Spellchecker, toastr) {
        // Initialize variables.
        $scope.files = Shared.files;
        var ipcRenderer = require('electron').ipcRenderer;

        // ----- Files ----- //

        // Load a file on either the source or the target pane.
        $scope.loadFile = function(type, fileData) {
            $scope.files[type].dirty = false;
            $scope.files[type].name = fileData.name;
            $scope.files[type].path = fileData.path;
            $scope.files[type].content = fileData.lines;

            Editor.initialize(
                type,
                type === 'source'? '#source-file' : '#target-file',
                type === 'source'? '#target-file' : '#source-file',
                fileData.lines
            );
        }

        // Copy the source's content into the target.
        $scope.copySource = function() {
            var lines = Editor.getContent('#source-file');
            var fileData = { lines: [] };
            for(var i=0; i<lines.length; i++) {
                fileData.lines.push({
                    'index': (i>0? (fileData.lines[i-1].index + lines[i-1].length) : 0),
                    'text': lines[i]
                })
            }
            $scope.loadFile('target', fileData);
        };

        // Event handler for when a file is read.
        $scope.onFileRead = function(event, result) {   
            // Verify if the operation was successful.
            if(result) {
                if(!result.error) {
                    // Load file.
                    $scope.loadFile(result.target, result.data);
                } else {
                    // Display warning or error.
                    if(result.error.code === 'NO_FILE_SELECTED') {
                        toastr.info('No file was selected');
                    } else {
                        toastr.error(result.error.message || "File couldn't be read", 'Error');
                    }
                }
            }

            // Update UI.
            $scope.$apply();
        }

        // Function for open a file selector.
        $scope.openFile = function(target) {
            // Open file selector dialog.
            ipcRenderer.send('open-file', target); 
        };

        // Initialize menu, defining methods for open files.
        Menu.init({
            openSource: function(item, focusedWindow) { 
                $scope.openFile('source'); 
                $scope.$apply(); 
            },
            openTarget: function(item, focusedWindow) { 
                $scope.openFile('target'); 
                $scope.$apply(); 
            },
        });
        ipcRenderer.on('file-read', $scope.onFileRead);

        // Load (if availables) the last opened files.
        ipcRenderer.send('last-file', 'source');
        ipcRenderer.send('last-file', 'target');
    }
]);
