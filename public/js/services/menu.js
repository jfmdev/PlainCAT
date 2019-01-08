// Load dependencies.
var ipcRenderer = require('electron').ipcRenderer;
var remote = require('electron').remote;

// Define default template (source: https://github.com/atom/electron/blob/master/docs/api/menu.md).
var default_template = [
  {
    label: 'Edit',
    submenu: [
      // {
        // label: 'Undo',
        // accelerator: 'CmdOrCtrl+Z',
        // role: 'undo'
      // },
      // {
        // label: 'Redo',
        // accelerator: 'Shift+CmdOrCtrl+Z',
        // role: 'redo'
      // },
      // {
        // type: 'separator'
      // },
      {
        label: 'Find',
        accelerator: 'CmdOrCtrl+F',
        click: function(item, focusedWindow) {
          ipcRenderer.sendToHost('toggleSearch');
        }
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      },
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.reload();
        }
      },
      {
        label: 'Toggle Full Screen',
        accelerator: (function() {
          if (process.platform == 'darwin')
            return 'Ctrl+Command+F';
          else
            return 'F11';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: (function() {
          if (process.platform == 'darwin')
            return 'Alt+Command+I';
          else
            return 'Ctrl+Shift+I';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.toggleDevTools();
        }
      },
    ]
  },
  {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      },
    ]
  },
  // {
    // label: 'Help',
    // role: 'help',
    // submenu: [
      // {
        // label: 'Learn More',
        // click: function() { require('electron').shell.openExternal('http://electron.atom.io') }
      // },
    // ]
  // },
];

// Service for initialize the application's menu.
myApp.factory('Menu', ['$uibModal', '$rootScope', function($uibModal, $rootScope) {
    // Get menu and define template.
    var Menu = remote.Menu;
    var template = [].concat(default_template);

    // Remove 'View' section when running on production.
    if(!ipcRenderer.sendSync('is-dev')) {
        template = _.filter(template, function(section) { return section.label !== 'View'; }); 
    }

    // Add 'File' section to default template.
    var openSourceItem = {
        label: 'Open',
        accelerator: 'CmdOrCtrl+O',
        click: function(item, focusedWindow) {}
    };
    var openTargetItem = {
        label: 'Open',
        accelerator: 'CmdOrCtrl+Shift+O',
        click: function(item, focusedWindow) {}
    };
    var saveSourceItem = {
        label: 'Save',
        accelerator: 'CmdOrCtrl+S',
        click: function(item, focusedWindow) {}
    };
    var saveTargetItem = {
        label: 'Save',
        accelerator: 'CmdOrCtrl+Shift+S',
        click: function(item, focusedWindow) {}
    };
    var saveAsSourceItem = {
        label: 'Save As...',
        click: function(item, focusedWindow) {}
    };
    var saveAsTargetItem = {
        label: 'Save As...',
        click: function(item, focusedWindow) {}
    };
    var closeSourceItem = {
        label: 'Close',
        click: function(item, focusedWindow) {}
    };
    var closeTargetItem = {
        label: 'Close',
        click: function(item, focusedWindow) {}
    };
    var exitItem = {
        label: 'Exit',
        click: function(item, focusedWindow) {}
    };
    template.unshift({
        label: 'File', 
        submenu: [
            {
              label: 'Source',
              submenu: [
                  openSourceItem, 
                  saveSourceItem,
                  saveAsSourceItem,
                  closeSourceItem, 
              ]
            },
            {
              label: 'Target',
              submenu: [
                  openTargetItem, 
                  saveTargetItem,
                  saveAsTargetItem,
                  closeTargetItem,
              ]
            },
            exitItem,
        ] 
    });

    // Add 'Translate' section to default template.
    template.push({
        label: 'Translate', 
        submenu: [
            {
                label: 'Translate',
                accelerator: 'CmdOrCtrl+T',
                click: function(item, focusedWindow) {
                    $rootScope.$emit('menu-translate');
                }
            },
            {
                label: 'Paste Translation',
                accelerator: 'CmdOrCtrl+Shift+T',
                click: function(item, focusedWindow) {
                    $rootScope.$emit('menu-paste-translation');
                }
            },
        ] 
    });

    // Add 'Settings' section to default template.
    var openSettings = function(defaultTab) {
        $uibModal.open({
            templateUrl: 'views/settings.html',
            controller: 'settingsController',
            size: 'lg',
            resolve: {
                tab: function () { return defaultTab; }
            }
        });
    };
    template.push({
        label: 'Settings', 
        submenu: [
            {
                label: 'General',
                click: openSettings.bind(this, 'general')
            },
            {
                label: 'Languages',
                click: openSettings.bind(this, 'languages')
            },
            {
                label: 'Translation',
                click: openSettings.bind(this, 'translation')
            },
            {
                label: 'About',
                click: openSettings.bind(this, 'about')
            }
        ]
    });

    // Define factory.
    var factory = {
        init: function(settings) {
            // Set listeners for file's subitems.
            if(settings.openSource) openSourceItem.click = settings.openSource;
            if(settings.openTarget) openTargetItem.click = settings.openTarget;
            if(settings.saveSource) saveSourceItem.click = settings.saveSource;
            if(settings.saveTarget) saveTargetItem.click = settings.saveTarget;
            if(settings.saveSourceAs) saveAsSourceItem.click = settings.saveSourceAs;
            if(settings.saveTargetAs) saveAsTargetItem.click = settings.saveTargetAs;
            if(settings.closeSource) closeSourceItem.click = settings.closeSource;
            if(settings.closeTarget) closeTargetItem.click = settings.closeTarget;
            if(settings.exit) exitItem.click = settings.exit;

            // Build and set menu.
            var menu = Menu.buildFromTemplate(template);
            Menu.setApplicationMenu(menu);
        }
    };

    // Return factory.
    return factory;
}]);

