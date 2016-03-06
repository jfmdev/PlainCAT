
// Load dependencies.
var ipcRenderer = require('electron').ipcRenderer

// Declare application.
var myApp = angular.module('myApp', ['menuSvc', 'blockUI', 'ngAnimate', 'toastr']);

// Define controller.
myApp.controller('mainController', ['$scope', 'Menu', 'blockUI', 'toastr', function ($scope, Menu, blockUI, toastr) {
    // Initialize.
    $scope.sourceLoaded = false;
    $scope.destinationLoaded = false;
  
    // Event handler for when a file is read.
    $scope.onFileRead = function(event, result) {   
        // Verify if the operation was successful.
        if(result && !result.error) {
            if(result.target == 'source') {
                $scope.sourceLoaded = true;
                $('#source-file').html(formatText(result.data));
                
                $('#source-file p').focus(function(event) {
                   $(this).addClass('editing');
                   $('#destination-file').children().eq($(this).index()).addClass('editing_bis');
                }).blur(function(event) {
                   $(this).removeClass('editing');
                    $('#destination-file').children().eq($(this).index()).removeClass('editing_bis');
                });
                
                $('#source-file p').mouseenter(function(event) {
                    $('#destination-file').children().eq($(this).index()).addClass('highlight');
                }).mouseleave(function(event) {
                    $('#destination-file').children().eq($(this).index()).removeClass('highlight');
                });
            } else {
                $scope.destinationLoaded = true;
                $('#destination-file').html(formatText(result.data));
                
                $('#destination-file p').focus(function(event) {                 
                   $(this).addClass('editing');
                   $('#source-file').children().eq($(this).index()).addClass('editing_bis');
                }).blur(function(event) {                 
                   $(this).removeClass('editing');
                    $('#source-file').children().eq($(this).index()).removeClass('editing_bis');
                });
                
                $('#destination-file p').mouseenter(function(event) {
                    $('#source-file').children().eq($(this).index()).addClass('highlight');
                }).mouseleave(function(event) {
                    $('#source-file').children().eq($(this).index()).removeClass('highlight');
                });
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

// Format a document read from a file.
function formatText(lines) {
    var res = '';
    for(var i=0; i<lines.length; i++) {
        res += '<p data-index="'+i+'" contenteditable="true">' + lines[i].text + '</p>';
    }
    return res;
}
