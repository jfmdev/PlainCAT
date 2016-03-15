'use strict';

// Load modules.
const electron = require('electron');
const ipcMain = electron.ipcMain;
const dialog = electron.dialog;
const fs = require('fs');


// ----- Initialization ----- // 

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


// ----- File management ----- // 

// Initialize files.
var openedFiles = {};

// Event for open and read a text file.
ipcMain.on('open-file', function(event, target) {
    // Read file.
    var files = dialog.showOpenDialog({ properties: [ 'openFile' ]});
    
    // Verify if the file was selected.
    if(files != null && files.length > 0) {
        // Read file.
        fs.readFile(files[0], 'utf8', function (err, data) {   
            // Verify if the file was read.
            if (!err) {
                // Parse file's data.
                var docLines = getDocLines(data);
              
                // Save file's path and data.
                openedFiles[target] = {'path': files[0], 'data': docLines};
              
                // Return data.
                event.sender.send('file-read', {'error': null, 'data': docLines, 'target': target});
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

// Verify if a file already opened can be read.
ipcMain.on('cached-file', function(event, target) {
   event.returnValue = openedFiles[target] != null? openedFiles[target].data : null;
});

// Parse a file, separating his lines.
function getDocLines(text) {
    // Initialization.
    var result = [];
    var regexp = /(\r\n|\n)+/g;

    if(text != null && typeof text == 'string') {
        // Generate indexes.
        var match, indexes= [];
        while (match = regexp.exec(text)) {
            indexes.push({
                'start': match.index, 
                'end': (match.index+match[0].length)
            });
        }
        
        // Generate result.
        var start = 0, end;
        for(var i=0; i<=indexes.length; i++) {
            start = (i > 0)? indexes[i-1].end : 0;
            end = (i < indexes.length)? indexes[i].start : text.length;
            
            if(start != end) {
                result.push({'index': start, 'text': text.substring(start, end)});
            }              
        }
    }
    
    // Return result.
    return result;
}


// ----- Spell check ----- //

const SpellChecker = require('simple-spellchecker');
const DICTIONARIES_FOLDER = "./node_modules/simple-spellchecker/dict";
var Dictionaries = {};

// Event for load a dictionary.
ipcMain.on('dictionary.load', function(event, lang) {
    // Verify if the dictionary is not already loaded.
    if(Dictionaries[lang] == null) {
        // Load dictionary.
        SpellChecker.getDictionary(lang, DICTIONARIES_FOLDER, function(err, result) {
            // Return result.
            Dictionaries[lang] = result;
            event.sender.send('dictionary.loaded', {'error': err, 'success': result != null});
        }); 
    } else {
        // Return success message.
        event.sender.send('dictionary.loaded', {'error': null, 'success': true});
    }
});

// Check a word in a loaded dictionary.
ipcMain.on('dictionary.check-word', function(event, lang, word) {
  var res = null;
  if(lang != null && Dictionaries[lang] != null && word != null) {
    res = Dictionaries[lang].spellCheck(word);
  }
  event.returnValue = res;
});


