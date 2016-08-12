
// Load dependencies.
var ipcRenderer = require('electron').ipcRenderer


// Get web frame.
var webFrame = require('electron').webFrame;

// Declare application.
var myApp = angular.module('myApp', ['menuSvc', 'editorSvc', 'translatorSvc', 'blockUI', 'ngAnimate', 'toastr']);

// Define controller.
myApp.controller('mainController', ['$scope', 'Menu', 'Editor', 'Translator', 'blockUI', 'toastr', function ($scope, Menu, Editor, Translator, blockUI, toastr) {
    // Initialize file's flags.
    $scope.sourceLoaded = false;
    $scope.destinationLoaded = false;
  
    // Load a file on either the source or the destination pane.
    $scope.loadFile = function(target, fileData) {
        if(target == 'source') {
            // Load file on source.
            $scope.sourceLoaded = true;
            Editor.initialize('source', '#source-file', '#destination-file', fileData);
        } else {
            // Load file on destination.
            $scope.destinationLoaded = true;
            Editor.initialize('destination', '#destination-file', '#source-file', fileData);
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

    
    // Function invoked when a language is selected.
    $scope.languageSelected = function(type, newValue) {
        // Update translator.
        Translator.setLanguage(type, newValue);
    }
    
    // Initialize list of available languages (TODO: This list should be configurable by the user, i.e. not harcoded).
    $scope.mainLanguages = [
        {name: 'Dutch', lang_code: 'nl', dictionary: 'nl-NL'},
        {name: 'English (US)', lang_code: 'en', dictionary: 'en-US'},
        {name: 'English (UK)', lang_code: 'en', dictionary: 'en-GB'},
        {name: 'French', lang_code: 'fr', dictionary: 'fr-FR'},
        {name: 'German', lang_code: 'de', dictionary: 'de-DE'},
        {name: 'Spanish (Spain)', lang_code: 'es', dictionary: 'es-ES'},
        {name: 'Spanish (Mexico)', lang_code: 'es', dictionary: 'es-MX'},
    ];
    
    // Initialize translation languages (TODO: should initialize with last selected values).
    $scope.sourceLang = _.find($scope.mainLanguages, function(item) {return item.dictionary == 'en-US'});
    Translator.setLanguage('source', $scope.sourceLang);
    $scope.destinationLang = _.find($scope.mainLanguages, function(item) {return item.dictionary == 'es-ES'}); 
    Translator.setLanguage('destination', $scope.destinationLang);
}]);
