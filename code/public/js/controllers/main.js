// Define controller.
myApp.controller('mainController', [
    '$scope', 'Shared', 'Menu', 'toastr', 
    function ($scope, Shared, Menu, toastr) {
        var ipcRenderer = require('electron').ipcRenderer;

        // ----- Files ----- //

        // Load a file on either the source or the target pane.
        $scope.loadFile = function(type, fileData) {
            Shared.files[type] = {
                dirty: false,
                name: fileData.name,
                path: fileData.path,
                content: fileData.lines,
            };
        }

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
