// Define controller.
myApp.controller('headerController', [
    '$scope', '$rootScope', 'Shared', 'Languages', 'FileManager',
    function ($scope, $rootScope, Shared, Languages, FileManager) {
        // Initialize variables.
        $scope.mainLanguages = [];
        $scope.lang = Languages.lang;
        $scope.files = Shared.files;

        // Update list of enabled languages.
        var updateLanguageList = function() {
            var langs = [];
            for(var i=0; i<Languages.list.length; i++) {
                var lang = Languages.list[i];
                if(Shared.isLanguageEnabled(lang.code)) {
                    langs.push(lang);
                }
            }
            $scope.mainLanguages = langs;
        };
        updateLanguageList();

        // Close a file.
        $scope.closeFile = FileManager.closeFile;

        // Open a file.
        $scope.openFile = FileManager.openFile;

        // Save a file.
        $scope.saveFile = FileManager.saveFile;

        // Save a file with a new name.
        $scope.saveFileAs = FileManager.saveFileAs;

        // Copy the source's content into the target.
        $scope.copySource = FileManager.copySource;

        // Update language in settings when changing a combo box.
        $scope.languageSelected = function(type, newValue) {
            Languages.setLang(type, newValue);
        };

        // Remove extension from file name.
        $scope.removeExtension = function(fileName) {
            return (fileName || '').replace(/\.[^/.]+$/, "");
        };
        
        // List for changes on settings for update available list.
        var unregisterListener = $rootScope.$on('settings-updated', function(evt, data) {
            if(data.name === 'languages') {
                updateLanguageList();
            }
        });

        $scope.$on('$destroy', function() {
            unregisterListener();
        });
    }
]);
