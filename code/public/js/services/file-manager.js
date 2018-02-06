// Service for manage files.
myApp.factory('FileManager', [
    '$rootScope', 'toastr', 'Shared', 
    function($rootScope, toastr, Shared) {
        var service = {};
        var ipcRenderer = require('electron').ipcRenderer;

        // Load a file on either the source or the target panel.
        service._loadFile = function(type, fileData) {
            Shared.files[type] = {
                dirty: false,
                name: fileData.name,
                path: fileData.path,
                content: fileData.lines,
            };
        }

        // Event handler for when a file is read.
        service._onFileRead = function(event, result) {   
            // Verify if the operation was successful.
            if(result) {
                if(!result.error) {
                    // Load file.
                    service._loadFile(result.target, result.data);
                } else {
                    // Display warning or error.
                    if(result.error.code === 'NO_FILE_SELECTED') {
                        toastr.info('No file was selected');
                    } else {
                        toastr.error(result.error.message || "File couldn't be read", 'Error');
                    }
                }
            }
        }

        // Function for open a file selector.
        service.openFile = function(target) {
            // Open file selector dialog.
            ipcRenderer.send('open-file', target); 
        };
        ipcRenderer.on('file-read', service._onFileRead);

        return service;
    }
]);

