// Define controller.
myApp.controller('settingsController', [
    '$scope', '$rootScope', 'Shared', 'Languages', 'Translator', '$uibModalInstance', 'tab',
    function ($scope, $rootScope, Shared, Languages, Translator, $uibModalInstance, tab) {
        // Initialize active tab.
        $scope.activeTab = 0;
        if(tab === 'spellchecker') { $scope.activeTab = 0; }
        if(tab === 'translation') { $scope.activeTab = 1; }
        if(tab === 'about') { $scope.activeTab = 2; }

        // Translation settings.
        $scope.yandex = Shared.settings.api_yandex;
        $scope.microsoft = Shared.settings.api_microsoft;

        $scope.updateTranslation = function(engine) {
            Shared.setApiData(engine, $scope[engine]);
        };
        
        // Language settings.
        $scope.languages = Languages.list;
        $scope.langSettings = Shared.settings.languages;

        $scope.toggleLanguage = function(lang) {
            if($scope.langSettings.disabled.indexOf(lang.code) >= 0) {
                $scope.langSettings.disabled = _.without($scope.langSettings.disabled, lang.code);
            } else {
                $scope.langSettings.disabled.push(lang.code);
            }
            Shared.setSettingValue('languages', $scope.langSettings);
        };

        $scope.localeUpdated = function(lang) {
            Shared.setSettingValue('languages', $scope.langSettings);
        };

        for(var i=0; i<$scope.languages.length; i++) {
            var lang = $scope.languages[i];
            if(lang.spellcheck && !$scope.langSettings.locales[lang.code]) {
                $scope.langSettings.locales[lang.code] = lang.spellcheck[0].locale;
            }
        }

        // Cancel button.
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);
