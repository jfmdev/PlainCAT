
// Load modules.
var ipcRenderer = require('electron').ipcRenderer

// Declare application.
var myApp = angular.module('myApp', []);

// Define controller.
myApp.controller('mainController', function ($scope) {
    // Initialize.
    $scope.document = {};
  
    // Event handler for when a file is read.
    $scope.onFileRead = function(event, result) {
        // Verify if the operation was successful.
        if(result && !result.error) {
            $scope.document = parseFile(result.data);
        } else {
            // TODO: Print error.
        }
        $scope.$apply();
    }

    // Behaviour for when the 'open file' button is pressed.
    $scope.openFile = function() {
        ipcRenderer.send('open-file');
    }
    ipcRenderer.on('file-read', $scope.onFileRead);
});

// Parse a file, separating his lines.
function parseFile(text) {
    // Initialization.
    var result = [];
    var regexp = /(\n\r|\n)+/g;

    // Generate indexes.
    var match, indexes= [];
    while (match = regexp.exec(text)) {
        indexes.push({
            'start': match.index, 
            'end': (match.index+match[0].length) 
        });
    }
    
    // Generate result.
    var start = 0, end;
    for(var i=0; i<=indexes.length; i++) {
        start = (i > 0)? indexes[i-1].end : 0;
        end = (i < indexes.length)? indexes[i].start : text.length;
        
        if(start != end) {
            result.push({'index': start, 'text': text.substring(start, end)});
        }              
    }
    
    // Return result.
    return result;
}
