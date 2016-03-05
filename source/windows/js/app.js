
// Load dependencies.
var ipcRenderer = require('electron').ipcRenderer

// Declare application.
var myApp = angular.module('myApp', ['menuSvc']);

// Define controller.
myApp.controller('mainController', ['$scope', 'Menu', function ($scope, Menu) {
    // Initialize.
    $scope.sourceDoc = [];
    $scope.destinationDoc = [];
  
    // Event handler for when a file is read.
    $scope.onFileRead = function(event, result) {
        // Verify if the operation was successful.
        if(result && !result.error) {
            if(result.target == 'source') {
                $scope.sourceDoc = result.data;
            } else {
                $scope.destinationDoc = result.data;
            }
        } else {
            // TODO: Print error.
        }
        // TODO: Show loading dialog.
        
        // Update UI.
        $scope.$apply();
        
        // TODO: Close loading dialog.
    }

    // Initialize menu, defining methods for open files.
    Menu.init({
        openSource: function(item, focusedWindow) { ipcRenderer.send('open-file', 'source'); },
        openDestination: function(item, focusedWindow) { ipcRenderer.send('open-file', 'destination'); }
    });
    ipcRenderer.on('file-read', $scope.onFileRead);
}]);

