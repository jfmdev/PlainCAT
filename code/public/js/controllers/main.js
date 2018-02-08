// Define controller.
myApp.controller('mainController', [
    '$scope', '$ngConfirm', 'Shared', 'Menu', 'FileManager',
    function ($scope, $ngConfirm, Shared, Menu, FileManager) {
        var ipcRenderer = require('electron').ipcRenderer;
        var remote = require('electron').remote

        // Initialize menu, defining methods for manipulate files.
        Menu.init({
            openSource: function(item, focusedWindow) { 
                FileManager.openFile('source'); 
            },
            openTarget: function(item, focusedWindow) { 
                FileManager.openFile('target'); 
            },
            saveSource: function(item, focusedWindow) { 
                FileManager.saveFile('source'); 
            },
            saveTarget: function(item, focusedWindow) { 
                FileManager.saveFile('target'); 
            },
            saveSourceAs: function(item, focusedWindow) { 
                FileManager.saveFileAs('source'); 
            },
            saveTargetAs: function(item, focusedWindow) { 
                FileManager.saveFileAs('target'); 
            },
            closeSource: function(item, focusedWindow) { 
                FileManager.closeFile('source'); 
            },
            closeTarget: function(item, focusedWindow) { 
                FileManager.closeFile('target'); 
            },
            exit: function(item, focusedWindow) { 
                var window = remote.getCurrentWindow();
                
                // Ask confirmation if they are unsaved files.
                if(Shared.files.source.dirty || Shared.files.target.dirty) {
                    $ngConfirm({
                        title: 'You have unsaved changes',
                        content: 'Are you sure you want to exit without saving your changes?',
                        columnClass: 'col-xs-offset-1 col-xs-10 col-sm-offset-2 col-sm-8 col-md-offset-3 col-md-6',
                        buttons: {
                            yes: {
                                text: 'Yes, exit anyway',
                                btnClass: 'btn-orange',
                                action: function(scope, button){
                                    // Close app.
                                    window.close();
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
                    // Close app.
                    window.close();
                }
            },
        });

        // Load (if availables) the last opened files.
        ipcRenderer.send('last-file', 'source');
        ipcRenderer.send('last-file', 'target');
    }
]);
