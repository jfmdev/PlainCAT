// Define controller.
myApp.controller('mainController', [
    '$scope', 'Menu', 'Editor', 'Translator', 'Spellchecker', 'toastr', 
    function ($scope, Menu, Editor, Translator, Spellchecker, toastr) {
        // Initialize variables.
        var ipcRenderer = require('electron').ipcRenderer;

        // ----- Files ----- //

        // Initialize file's variables.
        $scope.sourceLoaded = false;
        $scope.destinationLoaded = false;

        // Load a file on either the source or the destination pane.
        $scope.loadFile = function(target, fileData) {
            if(target == 'source') {
                // Load file on source.
                $scope.sourceLoaded = true;
                Editor.initialize('source', '#source-file', '#destination-file', fileData);
            } else {
                // Load file on destination.
                $scope.destinationLoaded = true;
                Editor.initialize('destination', '#destination-file', '#source-file', fileData);
            }
        }

        // Copy the source's content into the destination.
        $scope.copySource = function() {
            var lines = Editor.getContent('#source-file');
            var fileData = [];
            for(var i=0; i<lines.length; i++) {
                fileData.push({
                    'index': (i>0? (fileData[i-1].index + lines[i-1].length) : 0),
                    'text': lines[i]
                })
            }
            $scope.loadFile('destination', fileData);
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
            openDestination: function(item, focusedWindow) { 
                $scope.openFile('destination'); 
                $scope.$apply(); 
            },
        });
        ipcRenderer.on('file-read', $scope.onFileRead);

        // Load (if availables) the last opened files.
        ipcRenderer.send('last-file', 'source');
        ipcRenderer.send('last-file', 'destination');
    }
]);
