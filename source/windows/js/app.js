
// Load dependencies.
var ipcRenderer = require('electron').ipcRenderer

// Declare application.
var myApp = angular.module('myApp', ['menuSvc', 'blockUI', 'ngAnimate', 'toastr']);

// Define controller.
myApp.controller('mainController', ['$scope', 'Menu', 'blockUI', 'toastr', function ($scope, Menu, blockUI, toastr) {
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
            // Display error.
            toastr.error(result.error, 'Error');
        }
        
        // Unblock the user interface
        blockUI.stop();

        // Update UI.
        $scope.$apply();
    }

    // Function for open a file selector.
    $scope.openFile = function(target) {
        blockUI.start(); 
        ipcRenderer.send('open-file', target); 
    };
    
    // Initialize menu, defining methods for open files.
    Menu.init({
        openSource: function(item, focusedWindow) { $scope.openFile('source'); },
        openDestination: function(item, focusedWindow) { $scope.openFile('destination'); }
    });
    ipcRenderer.on('file-read', $scope.onFileRead);
}]);

