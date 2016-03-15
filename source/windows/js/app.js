
// Load dependencies.
var ipcRenderer = require('electron').ipcRenderer


// Get web frame.
var webFrame = require('electron').webFrame;

// Ask, by default, to load the en-US dictionary.
ipcRenderer.send('dictionary.load', "en-US"); 

// When the dictionary is loaded, use it.
ipcRenderer.on('dictionary.loaded', function(event, result) {
    webFrame.setSpellCheckProvider("en-US", false, {
        spellCheck: function(text) {      
            var res = ipcRenderer.sendSync('dictionary.check-word', 'en-US', text);
            return res != null? res : true;
        }
    });
});


// Declare application.
var myApp = angular.module('myApp', ['menuSvc', 'editorSvc', 'blockUI', 'ngAnimate', 'toastr']);

// Define controller.
myApp.controller('mainController', ['$scope', 'Menu', 'Editor', 'blockUI', 'toastr', function ($scope, Menu, Editor, blockUI, toastr) {
    // Initialize.
    $scope.sourceLoaded = false;
    $scope.destinationLoaded = false;
  
    // Load a file on either the source or the destination pane.
    $scope.loadFile = function(target, fileData) {
        if(target == 'source') {
            // Load file on source.
            $scope.sourceLoaded = true;
            Editor.initialize('#source-file', '#destination-file', fileData);
        } else {
            // Load file on destination.
            $scope.destinationLoaded = true;
            Editor.initialize('#destination-file', '#source-file', fileData);
        }
    }
  
    // Event handler for when a file is read.
    $scope.onFileRead = function(event, result) {   
        // Verify if the operation was successful.
        if(result && !result.error) {
            // Load file.
            $scope.loadFile(result.target, result.data);
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
    
    // Verify if they are files already loaded.
    var cachedSource = ipcRenderer.sendSync('cached-file', 'source');
    if(cachedSource != null) { $scope.loadFile('source', cachedSource); }
    var cachedDestination = ipcRenderer.sendSync('cached-file', 'destination');
    if(cachedDestination != null) { $scope.loadFile('destination', cachedDestination); }
}]);
