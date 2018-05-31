// Define controller.
myApp.controller('settingsController', [
    '$scope', '$rootScope', 'Shared', 'Translator', '$uibModalInstance', 'tab',
    function ($scope, $rootScope, Shared, Translator, $uibModalInstance, tab) {
        $scope.activeTab = 0;
        if(tab === 'general') { $scope.activeTab = 0; }
        if(tab === 'translation') { $scope.activeTab = 1; }
        if(tab === 'about') { $scope.activeTab = 2; }

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.save = function () {
            alert('Feature not implemented');
        };
    }
]);
