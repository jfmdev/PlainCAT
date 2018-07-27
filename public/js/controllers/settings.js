// Define controller.
myApp.controller('settingsController', [
    '$scope', '$rootScope', 'Shared', 'Translator', '$uibModalInstance', 'tab',
    function ($scope, $rootScope, Shared, Translator, $uibModalInstance, tab) {
        // Initialize active tab.
        $scope.activeTab = 0;
        if(tab === 'spellchecker') { $scope.activeTab = 0; }
        if(tab === 'translation') { $scope.activeTab = 1; }
        if(tab === 'about') { $scope.activeTab = 2; }

        // Translation settings.
        Shared.linkStore($scope, $scope, 'yandex', 'yandex');
        Shared.linkStore($scope, $scope, 'microsoft', 'microsoft');

        $scope.updateTranslation = function(engine) {
            Shared.store.set(engine, $scope[engine]);
        };

        // Language settings.
        $scope.languages = Shared.languages;
        $scope.langSettings = {};
        Shared.linkStore($scope, $scope.langSettings, 'disabledLanguages', 'disabled');
        Shared.linkStore($scope, $scope.langSettings, 'languageLocales', 'locales');

        $scope.toggleLanguage = function(lang) {
            if($scope.langSettings.disabled.indexOf(lang.code) >= 0) {
                $scope.langSettings.disabled = _.without($scope.langSettings.disabled, lang.code);
            } else {
                $scope.langSettings.disabled.push(lang.code);
            }
            Shared.store.set('disabledLanguages', $scope.langSettings.disabled);
        };

        $scope.localeUpdated = function(lang) {
            Shared.store.set('languageLocales', $scope.langSettings.locales);
        };

        for(var i=0; i<$scope.languages.length; i++) {
            var lang = $scope.languages[i];
            if(lang.spellcheck && !$scope.langSettings.locales[lang.code]) {
                $scope.langSettings.locales[lang.code] = lang.spellcheck[0].locale;
            }
        }

        // Buttons.
        $scope.checkAll = function() {
            $scope.langSettings.disabled = [];
            Shared.store.set('disabledLanguages', $scope.langSettings.disabled);
        };

        $scope.checkWithSpellchecker = function() {
            var withoutSpellchecker = _.filter($scope.languages, function(language) { return !language.spellcheck; });
            $scope.langSettings.disabled = _.map(withoutSpellchecker, function(language) { return language.code; });
            Shared.store.set('disabledLanguages', $scope.langSettings.disabled);
        };

        $scope.uncheckAll = function() {
            $scope.langSettings.disabled = _.map($scope.languages, function(language) { return language.code; });
            Shared.store.set('disabledLanguages', $scope.langSettings.disabled);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);
