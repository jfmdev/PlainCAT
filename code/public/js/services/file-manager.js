// Service for manage files.
myApp.factory('FileManager', [
    '$rootScope', 'toastr', 'Shared', 
    function($rootScope, toastr, Shared) {
        var service = {};
        var ipcRenderer = require('electron').ipcRenderer;

        // --- Private methods --- //

        // Load a file on either the source or the target panel.
        service._loadFile = function(type, fileData) {
            Shared.files[type] = {
                dirty: false,
                name: fileData.name,
                path: fileData.path,
                content: fileData.lines,
            };

            // Update UI if need.
            if (!$rootScope.$$phase) $rootScope.$apply()
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

        // --- Public methods --- //

        // Function for open a file selector.
        service.openFile = function(type) {
            // Open file selector dialog.
            ipcRenderer.send('open-file', type); 
        };
        ipcRenderer.on('file-read', service._onFileRead);

        // Function for close a file.
        service.closeFile = function(type) {
            // TODO: Ask confirmation if the file is dirty.
            Shared.files[type] = {
                dirty: false,
                name: null,
                path: null,
                content: null,
            };

            // Update UI if need.
            if (!$rootScope.$$phase) $rootScope.$apply()
        };

        return service;
    }
]);

