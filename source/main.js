'use strict';

// ----- Initialization ----- // 

const electron = require('electron');

// Module to control application life.
const app = electron.app;

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600});

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/windows/index.html');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// ----- Application code ----- // 

// Load modules.
const ipcMain = require('electron').ipcMain;
const dialog = require('electron').dialog;
const fs = require('fs');

// Event for open and read a text file.
ipcMain.on('open-file', function(event) {
    // Read file.
    var files = dialog.showOpenDialog({ properties: [ 'openFile' ]});
    
    // Verify if the file was selected.
    if(files != null && files.length > 0) {
        // Read file.
        fs.readFile(files[0], 'utf8', function (err, data) {   
            // Verify if the file was read.
            if (!err) {
                // TODO: Save file's path and data.
              
                // Return data.
                event.sender.send('file-read', {'error': null, 'data': data});
            } else {
                // Return error.
                event.sender.send('file-read', {'error': {'code': "UNEXPECTED_ERROR", 'message': err}, 'data': null});
            }
        });
    } else {
        // Return error.
        event.sender.send('file-read', {'error': {'code': "NO_FILE_SELECTED", 'message': "No file was selected"}, 'data': null});
    }
});
