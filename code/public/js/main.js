// Define controller.
myApp.controller('mainController', ['$scope', 'Menu', 'Editor', 'Translator', 'Spellchecker', 'blockUI', 'toastr', function ($scope, Menu, Editor, Translator, Spellchecker, blockUI, toastr) {
    // Initialize variables.
    var ipcRenderer = require('electron').ipcRenderer;
    
    // ----- Files ----- //
    
    // Initialize file's variables.
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
    
    // Copy the source's content into the destionation.
    $scope.copySource = function() {
        var lines = Editor.getContent('#source-file');
        var fileData = [];
        for(var i=0; i<lines.length; i++) {
            fileData.push({
                'index': (i>0? (fileData[i-1].index + lines[i-1].length) : 0),
                'text': lines[i]
            })
        }
        $scope.loadFile('destination', fileData);
    };
    
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

    
    // ----- Spell checking and translations ----- //
    
    // Function invoked when a language is selected.
    $scope.languageSelected = function(type, newValue) {
        // Update translator.
        Translator.setLanguage(type, newValue);
    }
    
    // Initialize list of available languages (TODO: This list should be configurable by the user, i.e. not harcoded).
    $scope.mainLanguages = [
        {name: 'Dutch', lang_code: 'nl', locale: 'nl-NL'},
        {name: 'English (US)', lang_code: 'en', locale: 'en-US'},
        {name: 'English (UK)', lang_code: 'en', locale: 'en-GB'},
        {name: 'French', lang_code: 'fr', locale: 'fr-FR'},
        {name: 'German', lang_code: 'de', locale: 'de-DE'},
        {name: 'Spanish (Spain)', lang_code: 'es', locale: 'es-ES'},
        {name: 'Spanish (Mexico)', lang_code: 'es', locale: 'es-MX'},
    ];
    
    // Initialize translation languages.
    var sourceLocale = Translator.getLocale('source'); 
    $scope.sourceLang = _.find($scope.mainLanguages, function(item) {return item.locale == sourceLocale});
    Translator.setLanguage('source', $scope.sourceLang);
    
    var destinationLocale = Translator.getLocale('destination');
    $scope.destinationLang = _.find($scope.mainLanguages, function(item) {return item.locale == destinationLocale}); 
    Translator.setLanguage('destination', $scope.destinationLang);
}]);
