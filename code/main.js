'use strict';

// Load modules.
const electron = require('electron');
const ipcMain = electron.ipcMain;
const dialog = electron.dialog;
const path = require('path');
const fs = require('fs');
const jschardet = require('jschardet');


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
  mainWindow.loadURL('file://' + __dirname + '/public/index.html');

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


// ----- Storage ----- //

// Init storage.
const Storage = require('node-storage');
var settingsStore = new Storage('settings.json');

// Get a settings item.
ipcMain.on('settings-get', function(event, arg) {
  var item = settingsStore.get(arg);
  event.returnValue = item || false;
});

// Set a settings item.
ipcMain.on('settings-set', function(event, arg) {
  settingsStore.put(arg.name, arg.value);
  event.returnValue = true;
});


// ----- File management ----- // 

// Initialize files.
var openedFiles = {};

// Helper function for support reading files with and unknown encoding.
function readFileWithAnyEncoding(filePath, callback) {
    // Read file for detect his encoding.
    fs.readFile(filePath, function (err, rawBuffer) {
        // Verify if the file was read.
        if (!err) {
            // Detect file encoding.
            let encoding = (jschardet.detect(rawBuffer).encoding || 'UTF-8').toLowerCase();

            try{
                // Read file again with the corresponding encoding.
                fs.readFile(filePath, encoding, function (err2, data) {
                    callback(err2, data, encoding);
                });
            }catch(exp) {
                callback(exp + '', '', encoding);
            }
        } else {
            callback(err, '', null);
        }
    });
};

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

// Read a file and send the corresponding events.
function readAndParseFile(event, filePath, target) {
    // Read file.
    readFileWithAnyEncoding(filePath, function (err, fileData, encoding) {
        // Verify if the file was read.
        if (!err) {
            // Parse file's data.
            let docLines = getDocLines(fileData);

            // Save file's path and data.
            openedFiles[target] = {'path': filePath, 'data': docLines, 'encoding': encoding};
            settingsStore.put('app.file_'+target, filePath);

            // Return data.
            let fileReadData = {
                path: filePath,
                name: path.basename(filePath),
                lines: docLines,
                encoding: encoding,
            };

            event.sender.send('file-read', {'error': null, 'data': fileReadData, 'target': target});
        } else {
            // Return error.
            event.sender.send('file-read', {'error': {'code': "UNEXPECTED_ERROR", 'message': err}, 'data': null, 'target': target});
        }
    });
};

// Open and read a text file.
ipcMain.on('open-file', function(event, target) {
    // Read file.
    var files = dialog.showOpenDialog({ properties: ['openFile']});
    
    // Verify if the file was selected.
    if(files != null && files.length > 0) {
        readAndParseFile(event, files[0], target);
    } else {
        // Return error.
        event.sender.send('file-read', {'error': {'code': "NO_FILE_SELECTED", 'message': "No file was selected"}, 'data': null});
    }
});

// Verify if a file already opened can be read.
ipcMain.on('last-file', function(event, type) {
    var filePath = settingsStore.get('app.file_' + type);
    if(filePath) { readAndParseFile(event, filePath, type); }
});

// Saves a text file.
ipcMain.on('save-file', function(event, type, filePath, data, encoding) {
    // Save file.
    fs.writeFile(filePath, data, encoding || 'UTF-8', function(err) {
        // Return result.
        event.sender.send('file-saved', {
            'type': type, 
            'err': err,
            'path': filePath,
            'name': path.basename(filePath),
        });
    });
});

// Ask user to select a path and then saves a text file.
ipcMain.on('save-file-as', function(event, type, data, encoding) {
    // Read file.
    var filePath = dialog.showSaveDialog();
    
    // Verify if the file was selected.
    if(filePath) {
        // Save file.
        fs.writeFile(filePath, data, encoding || 'UTF-8', function(err) {
            // Return result.
            event.sender.send('file-saved', {
                'type': type, 
                'err': err,
                'path': filePath,
                'name': path.basename(filePath),
            });
        });
    } else {
        // Return error.
        event.sender.send('file-saved', {'type': type, 'err': "No file was selected"});
    }
});


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


// --- Supported languages --- //

// Get the list of supported languages.
ipcMain.on('get-languages', function(event) {
    // Read languages file.
    var fileContent = fs.readFileSync('./misc/languages.json');
    var langData = JSON.parse(fileContent);
    var res = langData.list;

    // Verify support of automatic translation.
    for(var provider in langData.translation) {
        for(var i=0; i<res.length; i++) {
            res[i][provider] = langData.translation[provider].indexOf( res[i].code ) >= 0;
        }
    }

    // Verify support for spellcheck.
    for(var i=0; i<res.length; i++) {
        res[i].spellcheck = langData.spellchecker[res[i].code]? langData.spellchecker[res[i].code] : false;
    }

    // Sort by name (instead of by code).
    res.sort(function(a, b) { return a.name < b.name? -1 : 1; });

    // TODO: Verify which languages are disabled.
    // Should read that from AppSettings.

    // TODO: Verify the preferred spell checkers.
    // Should read that from AppSettings.

    // Return result.
    event.returnValue = res;
});


// ----- Translation cache ----- //

const NodeCache = require("node-cache");
const translationCache = new NodeCache({ stdTTL: 120, checkperiod: 140 });

const crypto = require('crypto');
function sha1(data) {
     var generator = crypto.createHash('sha1');
     generator.update(data);
     return generator.digest('hex'); 
}

// Get a value from the translation cache.
ipcMain.on('cached-translation.get', function(event, fromLang, toLang, engine, content) {
    let translationKey = sha1(fromLang + '-' + toLang + '-' + engine + '-' + content);
    translationCache.get(translationKey, function(err, value){
        if(!err && value) {
            event.sender.send('cached-translation.got', value);
        } else {
            event.sender.send('cached-translation.got', null);
        }
    });
});

// Insert a value into the translation cache.
ipcMain.on('cached-translation.set', function(event, fromLang, toLang, engine, content, translation) {
    let translationKey = sha1(fromLang + '-' + toLang + '-' + engine + '-' + content);
    translationCache.set(translationKey, translation, function(err, success) {
        // Do nothing.
    });
});

// ----- Miscellaneous ----- //

// Get the current platform.
ipcMain.on('get-platform', function(event) {
    event.returnValue = process.platform;
});
