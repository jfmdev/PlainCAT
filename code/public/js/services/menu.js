
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

// if (process.platform == 'darwin') {
  // var name = require('electron').remote.app.getName();
  // template.unshift({
    // label: name,
    // submenu: [
      // {
        // label: 'About ' + name,
        // role: 'about'
      // },
      // {
        // type: 'separator'
      // },
      // {
        // label: 'Services',
        // role: 'services',
        // submenu: []
      // },
      // {
        // type: 'separator'
      // },
      // {
        // label: 'Hide ' + name,
        // accelerator: 'Command+H',
        // role: 'hide'
      // },
      // {
        // label: 'Hide Others',
        // accelerator: 'Command+Alt+H',
        // role: 'hideothers'
      // },
      // {
        // label: 'Show All',
        // role: 'unhide'
      // },
      // {
        // type: 'separator'
      // },
      // {
        // label: 'Quit',
        // accelerator: 'Command+Q',
        // click: function() { app.quit(); }
      // },
    // ]
  // });
  // template[3].submenu.push(
    // {
      // type: 'separator'
    // },
    // {
      // label: 'Bring All to Front',
      // role: 'front'
    // }
  // );
// };

// Service for initialize the application's menu.
myApp.factory('Menu', ['$uibModal', function($uibModal) {
    // Load dependencies.
    var remote = require('electron').remote;
    var Menu = remote.Menu;
    var template = [].concat(default_template);

    // Add 'File' section to default template.
    var openSourceItem = {
        label: 'Open source',
        accelerator: 'CmdOrCtrl+O',
        click: function(item, focusedWindow) {
          console.log("'Open Source' item clicked");
        }
    };
    var openTargetItem = {
        label: 'Open target',
        accelerator: 'CmdOrCtrl+T',
        click: function(item, focusedWindow) {
            console.log("'Open Target' item clicked");
        }
    };
    template.unshift({
        label: 'File', 
        submenu: [openSourceItem, openTargetItem] 
    });

    // Add 'Settings' section to default template.
    var languagesItem = {
        label: 'Languages',
        click: function(item, focusedWindow) {
            $uibModal.open({
                templateUrl: 'views/settings.languages.html'
            });
        }
    };
    var aboutItem = {
        label: 'About',
        click: function(item, focusedWindow) {
            $uibModal.open({ templateUrl: 'views/about.html' });
        }
    };
    template.push({
        label: 'Settings', 
        submenu: [languagesItem, aboutItem] 
    });

    // Define factory.
    var factory = {
        init: function(settings) {
            // Set listeners for file's subitems.
            if(settings && settings.openSource) openSourceItem.click = settings.openSource;
            if(settings && settings.openTarget) openTargetItem.click = settings.openTarget;
          
            // Build and set menu.
            var menu = Menu.buildFromTemplate(template);
            Menu.setApplicationMenu(menu);
        }
    };

    // Return factory.
    return factory;
}]);

