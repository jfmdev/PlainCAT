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

        // Cancel button.
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);
