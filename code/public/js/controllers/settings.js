// Define controller.
myApp.controller('settingsController', [
    '$scope', '$rootScope', 'Shared', 'Languages', 'Translator', '$uibModalInstance', 'tab',
    function ($scope, $rootScope, Shared, Languages, Translator, $uibModalInstance, tab) {
        // Initialize active tab.
        $scope.activeTab = 0;
        if(tab === 'spellchecker') { $scope.activeTab = 0; }
        if(tab === 'translation') { $scope.activeTab = 1; }
        if(tab === 'about') { $scope.activeTab = 2; }

        // Get list of languages.
        $scope.languages = Languages.list;

        // Save and cancel buttons.
        $scope.save = function () {
            alert('Feature not implemented');
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);
