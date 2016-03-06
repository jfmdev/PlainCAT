
// Load dependencies.
var ipcRenderer = require('electron').ipcRenderer

// Declare application.
var myApp = angular.module('myApp', ['menuSvc', 'editorSvc', 'blockUI', 'ngAnimate', 'toastr']);

// Define controller.
myApp.controller('mainController', ['$scope', 'Menu', 'Editor', 'blockUI', 'toastr', function ($scope, Menu, Editor, blockUI, toastr) {
    // Initialize.
    $scope.sourceLoaded = false;
    $scope.destinationLoaded = false;
  
    // Event handler for when a file is read.
    $scope.onFileRead = function(event, result) {   
        // Verify if the operation was successful.
        if(result && !result.error) {
            if(result.target == 'source') {
                // Load file on source.
                $scope.sourceLoaded = true;
                Editor.initialize('#source-file', '#destination-file', result.data);
            } else {
                // Load file on destination.
                $scope.destinationLoaded = true;
                Editor.initialize('#destination-file', '#source-file', result.data);
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
        openSource: function(item, focusedWindow) { $scope.openFile('source'); $scope.$apply(); },
        openDestination: function(item, focusedWindow) { $scope.openFile('destination'); $scope.$apply(); }
    });
    ipcRenderer.on('file-read', $scope.onFileRead);
}]);

