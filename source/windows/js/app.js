
// console.log("jQuery", jQuery);

var ipcRenderer = require('electron').ipcRenderer

// console.log(ipcRenderer.sendSync('synchronous-message', 'ping')); // prints "pong"

// ipcRenderer.on('asynchronous-reply', function(arg) {
  // console.log(arg); // prints "pong"
// });
// ipcRenderer.send('asynchronous-message', 'ping');

// Declare application.
var myApp = angular.module('myApp', []);

// Define controller.
myApp.controller('mainController', function ($scope) {

    $scope.openFile = function() {
        ipcRenderer.send('open-file');
    }
    
    ipcRenderer.on('file-read', function(event, data) {
        console.log('File read', data); // prints "pong"
    });

});
