// Service for manage files.
myApp.factory('FileManager', [
    '$rootScope', '$ngConfirm', 'toastr', 'Shared', 'Editor', 
    function($rootScope, $ngConfirm, toastr, Shared, Editor) {
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
                encoding: fileData.encoding,
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

        // Event handler for when a file is read.
        service._onFileSaved = function(event, result) {
            // Verify if the operation was successful.
            if(!result.err) {
                Shared.files[result.type].dirty = false;
                toastr.success('The file was saved');
            } else {
                toastr.error(result.err + '', "File not saved");
            }
        }

        // --- Listeners --- /

        // When a paragraph is edited, update the dirty flag.
        $rootScope.$on('paragraph-edited', function(event, data) {
            // Update flag.
            Shared.files[data.type].dirty = true;
            
            // Update UI if need.
            if (!$rootScope.$$phase) $rootScope.$apply();
        });

        // --- Public methods --- //

        // Function for open a file selector.
        service.openFile = function(type) {
            // Open file selector dialog.
            ipcRenderer.send('open-file', type); 
        };
        ipcRenderer.on('file-read', service._onFileRead);

        // Function for save a file.
        service.saveFile = function(type) {
            // Check if the file is defined.
            if(Shared.files[type].path) {
                // Get content.
                // TODO: Ideally should replace new paragraphs in original file.
                var paragraphSeparator =  ipcRenderer.sendSync('get-platform') !== 'win32'? '\n' : '\r\n';
                var content = Editor.getContentAsArray('#' + type + '-file').join(paragraphSeparator);

                // Save file.
                ipcRenderer.send('save-file', type, Shared.files[type].path, content, Shared.files[type].encoding);               
            } else {
                // Ask user to enter a file name first.
                service.saveFileAs(type);
            }
        };
        ipcRenderer.on('file-saved', service._onFileSaved);

        // Function for save a file with a new name.
        service.saveFileAs = function(type) {
            // TODO
        };

        // Function for close a file.
        service.closeFile = function(type, dontConfirm) {
            // Ask confirmation if the file is dirty (and if confirmation is not disabled).
            if(!dontConfirm && Shared.files[type].dirty) {
                // Ask confirmation.
                $ngConfirm({
                    title: 'The file have unsaved changes',
                    content: 'Are you sure you want to close this file without saving his changes?',
                    columnClass: 'col-xs-offset-1 col-xs-10 col-sm-offset-2 col-sm-8 col-md-offset-3 col-md-6',
                    buttons: {
                        yes: {
                            text: 'Yes, close it',
                            btnClass: 'btn-orange',
                            action: function(scope, button){
                                // Force closing the file.
                                service.closeFile(type, true);
                            }
                        },
                        no: {
                            text: 'No, I want to save first',
                            btnClass: 'btn-blue',
                            action: function(scope, button){
                                // Do nothing and close modal.
                            }
                        }
                    }
                });
            } else {
                // Close file.
                Shared.files[type] = {
                    dirty: false,
                    name: null,
                    path: null,
                    content: null,
                };

                // Update UI if need.
                if (!$rootScope.$$phase) $rootScope.$apply();
            }
        };

        return service;
    }
]);

