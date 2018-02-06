// Define controller.
myApp.controller('mainController', [
    '$scope', 'Shared', 'Menu', 'FileManager',
    function ($scope, Shared, Menu, FileManager) {
        var ipcRenderer = require('electron').ipcRenderer;

        // Initialize menu, defining methods for manipulate files.
        Menu.init({
            openSource: function(item, focusedWindow) { 
                FileManager.openFile('source'); 
                $scope.$apply(); 
            },
            openTarget: function(item, focusedWindow) { 
                FileManager.openFile('target'); 
                $scope.$apply(); 
            },
        });

        // Load (if availables) the last opened files.
        ipcRenderer.send('last-file', 'source');
        ipcRenderer.send('last-file', 'target');
    }
]);
