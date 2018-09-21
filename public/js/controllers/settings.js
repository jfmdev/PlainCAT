// Define controller.
myApp.controller('settingsController', [
    '$scope', '$rootScope', 'Shared', '$uibModalInstance', 'tab',
    function ($scope, $rootScope, Shared, $uibModalInstance, tab) {
        // Initialize active tab.
        $scope.activeTab = 0;
        if(tab === 'languages') { $scope.activeTab = 0; }
        if(tab === 'translation') { $scope.activeTab = 1; }
        if(tab === 'about') { $scope.activeTab = 2; }
        if(tab === 'general') { $scope.activeTab = 3; }

        // General settings.
        Shared.linkStoreToScope($scope, 'fontSize');
        Shared.linkStoreToScope($scope, 'fontFamily');
        $scope.fontFamilies = [
            {
                groupName: 'Serif fonts',
                list: [
                    { name: 'Georgia', value: 'Georgia, serif'},
                    { name: 'Palatino', value: '"Palatino Linotype", "Book Antiqua", Palatino, serif'},
                    { name: 'Times New Roman', value: '"Times New Roman", Times, serif'},
                ]
            },
            {
                groupName: 'Sans-Serif fonts',
                list: [
                    { name: 'Arial', value: 'Arial, Helvetica, sans-serif'},
                    { name: 'Arial Black', value: '"Arial Black", Gadget, sans-serif'},
                    { name: 'Comic Sans', value: '"Comic Sans MS", cursive, sans-serif'},
                    { name: 'Impact', value: 'Impact, Charcoal, sans-serif'},
                    { name: 'Lucida', value: '"Lucida Sans Unicode", "Lucida Grande", sans-serif'},
                    { name: 'Tahoma', value: 'Tahoma, Geneva, sans-serif'},
                    { name: 'Trebuchet', value: '"Trebuchet MS", Helvetica, sans-serif'},
                    { name: 'Verdana', value: 'Verdana, Geneva, sans-serif'},
                ]
            },
            {
                groupName: 'Monospace fonts',
                list: [
                    { name: 'Courier New', value: '"Courier New", Courier, monospace'},
                    { name: 'Lucida Console', value: '"Lucida Console", Monaco, monospace'},
                ]
            },
        ];
        $scope.updateFont = function(key, value) {
            Shared.store.set(key, value);
        };

        // Translation settings.
        Shared.linkStoreToScope($scope, 'yandex');
        Shared.linkStoreToScope($scope, 'microsoft');

        $scope.updateTranslation = function(engine) {
            Shared.store.set(engine, $scope[engine]);
        };

        // Language settings.
        $scope.languages = Shared.languages;
        Shared.linkStoreToScope($scope, 'disabledLanguages');
        Shared.linkStoreToScope($scope, 'languageLocales');

        $scope.toggleLanguage = function(lang) {
            if($scope.disabledLanguages.indexOf(lang.code) >= 0) {
                $scope.disabledLanguages = _.without($scope.disabledLanguages.disabled, lang.code);
            } else {
                $scope.disabledLanguages.push(lang.code);
            }
            Shared.store.set('disabledLanguages', $scope.disabledLanguages);
        };

        $scope.localeUpdated = function(lang) {
            Shared.store.set('languageLocales', $scope.languageLocales);
        };

        for(var i=0; i<$scope.languages.length; i++) {
            var lang = $scope.languages[i];
            if(lang.spellcheck && !$scope.languageLocales[lang.code]) {
                $scope.languageLocales[lang.code] = lang.spellcheck[0].locale;
            }
        }

        // Buttons.
        $scope.checkAll = function() {
            $scope.disabledLanguages = [];
            Shared.store.set('disabledLanguages', $scope.disabledLanguages);
        };

        $scope.checkWithSpellchecker = function() {
            var withoutSpellchecker = _.filter($scope.languages, function(language) { return !language.spellcheck; });
            $scope.disabledLanguages = _.map(withoutSpellchecker, function(language) { return language.code; });
            Shared.store.set('disabledLanguages', $scope.disabledLanguages);
        };

        $scope.uncheckAll = function() {
            $scope.disabledLanguages = _.map($scope.languages, function(language) { return language.code; });
            Shared.store.set('disabledLanguages', $scope.disabledLanguages);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);
