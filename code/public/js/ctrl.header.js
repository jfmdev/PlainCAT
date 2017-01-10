// Define controller.
myApp.controller('headerController', ['$scope', 'Settings', function ($scope, Settings) {
    // Initialize list of available languages.
    // TODO: This list should be configurable by the user, i.e. not harcoded.
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
    var sourceLocale = Settings.getLocale('source'); 
    $scope.sourceLang = _.find($scope.mainLanguages, function(item) {return item.locale == sourceLocale});
    Settings.setLanguage('source', $scope.sourceLang);
    
    var destinationLocale = Settings.getLocale('destination');
    $scope.destinationLang = _.find($scope.mainLanguages, function(item) {return item.locale == destinationLocale}); 
    Settings.setLanguage('destination', $scope.destinationLang);

    // Update language in settings when changing a combo box.
    $scope.languageSelected = function(type, newValue) {
        Settings.setLanguage(type, newValue);
    };
}]);
