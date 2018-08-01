// Service for manage files.
myApp.factory('FileManager', [
    '$rootScope', '$ngConfirm', 'toastr', 'Shared', 'Editor', 
    function($rootScope, $ngConfirm, toastr, Shared, Editor) {
        var service = {};
        var ipcRenderer = require('electron').ipcRenderer;

        // --- Private methods --- //

        // Load a file on either the source or the target panel.
        var loadFile = function(type, fileData) {
            Shared.files[type] = {
                dirty: false,
                name: fileData.name,
                path: fileData.path,
                content: fileData.lines,
                encoding: fileData.encoding,
                text: fileData.text,
            };

            // Update UI if need.
            if (!$rootScope.$$phase) $rootScope.$apply()
        }

        // Event handler for when a file is read.
        var onFileRead = function(event, result) {
            // Verify if the operation was successful.
            if(result) {
                if(!result.error) {
                    // Load file.
                    loadFile(result.target, result.data);
                } else {
                    // Display warning or error.
                    if(result.error.code === 'NO_FILE_SELECTED') {
                        toastr.info('No file was selected');
                    } else {
                        toastr.error(result.error.message || "File couldn't be read", 'Error opening file');
                    }
                }
            }
        }

        // Event handler for when a file is read.
        var onFileSaved = function(event, result) {
            // Verify if the operation was successful.
            if(!result.err) {
                Shared.files[result.type].dirty = false;
                Shared.files[result.type].name = result.name;
                Shared.files[result.type].path = result.path;
                toastr.success('The file was saved');
            } else {
                toastr.error(result.err + '', "File not saved");
            }
        }

        // Utility method for update the content of a document while preserving the end of lines.
        var generateText = function(text, content, newLines) {
            var newText = text;

            var length = newLines.length < content.length ? newLines.length : content.length;
            for(var i=(length-1); i>=0; --i) {
                var start = content[i].index;
                var end = start + content[i].length;
                newText = newText.substring(0, start) + newLines[i] + newText.substring(end, newText.length);
            }

            return newText;
        };

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
            // Check if there is a file already opened an if it's dirty.
            if(Shared.files[type].name && Shared.files[type].dirty) {
                // Ask confirmation.
                $ngConfirm({
                    title: 'The current file has unsaved changes',
                    content: 'Are you sure you want to open a new file, discarding the changes of the current file?',
                    columnClass: 'col-xs-offset-1 col-xs-10 col-sm-offset-2 col-sm-8 col-md-offset-3 col-md-6',
                    buttons: {
                        yes: {
                            text: 'Yes, discard changes and open file',
                            btnClass: 'btn-orange',
                            action: function(scope, button){
                                // Open file selector dialog anyway.
                                ipcRenderer.send('open-file', type); 
                            }
                        },
                        no: {
                            text: "No, don't open a new file",
                            btnClass: 'btn-blue',
                            action: function(scope, button){
                                // Do nothing and close modal.
                            }
                        }
                    }
                });
            } else {
                // Open file selector dialog.
                ipcRenderer.send('open-file', type); 
            }
        };
        ipcRenderer.on('file-read', onFileRead);

        // Function for save a file.
        service.saveFile = function(type) {
            // Check if the file is defined.
            if(Shared.files[type].path) {
                // Save file.
                var content = generateText(
                    Shared.files[type].text,
                    Shared.files[type].content,
                    Editor.getContentAsArray(type),
                );
                ipcRenderer.send('save-file', type, Shared.files[type].path, content, Shared.files[type].encoding);               
            } else {
                // Ask user to enter a file name first.
                service.saveFileAs(type);
            }
        };
        ipcRenderer.on('file-saved', onFileSaved);

        // Function for save a file with a new name.
        service.saveFileAs = function(type) {
            var content = generateText(
                Shared.files[type].text,
                Shared.files[type].content,
                Editor.getContentAsArray(type),
            );
            ipcRenderer.send('save-file-as', type, content, Shared.files[type].encoding);               
        };

        // Function for close a file.
        service.closeFile = function(type, dontConfirm) {
            // Ask confirmation if the file is dirty (and if confirmation is not disabled).
            if(!dontConfirm && Shared.files[type].dirty) {
                // Ask confirmation.
                $ngConfirm({
                    title: 'The file has unsaved changes',
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
                            text: "No, don't close it",
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
                    text: '',
                };

                // Update UI if need.
                if (!$rootScope.$$phase) $rootScope.$apply();
            }
        };

        // Copy the source's content into the target.
        service.copySource = function() {
            var lines = Editor.getContentAsArray('source');
            var content = [];
            var srcContent = Shared.files.source.content;
            for(var i=0; i<lines.length && i<srcContent.length; i++) {
                content.push({
                    'index': srcContent[i].index,
                    'length': srcContent[i].length,
                    'text': lines[i],
                })
            }

            // Update target (this will trigger the editor's initialization via the watcher).
            Shared.files.target = {
                dirty: true,
                name: null,
                path: null,
                content: content,
                encoding: Shared.files.source.encoding,
                text: Shared.files.source.text,
            };
        };

        return service;
    }
]);
