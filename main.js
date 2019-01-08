'use strict';

// Load modules.
const electron = require('electron');
const ipcMain = electron.ipcMain;
const dialog = electron.dialog;
const path = require('path');
const fs = require('fs');
const jschardet = require('jschardet');
const isDev = require('electron-is-dev');
const sha1File = require('sha1-file');

const Utils = require(__dirname + '/misc/utils');


// ----- Initialization ----- // 

// Module to control application life.
const app = electron.app;

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
  // Initialize web preferences and main URL.
  let webPrefs = { nodeIntegration: true };
  let mainUrl = path.join(__dirname, 'public/index.html');
  
  // Loading app.html directly (instead of loading index.html which embeds app.html in a webview)
  // will disable the Find feature will be disabled but Developer Tools will work better).
  // webPrefs = { nodeIntegration: false, preload: path.join(__dirname, 'public/js/preload.js') };
  // mainUrl = path.join(__dirname, 'public/app.html');

  // Create browser window and load html file.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: 'resources/img/icon-32.png',
    webPreferences: webPrefs
  });
  mainWindow.loadURL(mainUrl);

  // Open the DevTools if running in dev mode.
  if(isDev) mainWindow.webContents.openDevTools();

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


// --- Storage --- //

// Init storage.
const Storage = require('node-storage');
let settingsStore = new Storage(path.join(app.getPath('userData'), 'plaincat.json'));

// Get a settings item.
ipcMain.on('settings-get', function(event, arg) {
    let item = settingsStore.get(arg);
    event.returnValue = item || false;
});

// Set a settings item.
ipcMain.on('settings-set', function(event, arg) {
    settingsStore.put(arg.name, arg.value);
    event.returnValue = true;
});


// --- File management --- // 

// Initialize files.
let openedFiles = {};

// Remember the data of the files opened.
function storeFileData(type, filePath, encoding) {
    // Stop watching changes on the previous file.
    if(openedFiles[type] && openedFiles[type].watcher) {
        try{ openedFiles[type].watcher.close(); }catch(watErr) { console.log(watErr); }
    }

    // Save file's path and data.
    openedFiles[type] = {
        path: filePath,
        encoding: encoding,
        watcher: null,
        lastTime: false,
        sha1: null,
    };
    settingsStore.put('app.' + type + 'File', filePath);

    // Calculate SHA-1 hash.
    sha1File(filePath, (err1, sha1) => {
        openedFiles[type].sha1 = !err1 ? sha1 : null;

        // Watch for changes on the file.
        openedFiles[type].watcher = fs.watch(filePath, function(event, fileName) {
            // Don't trigger the event too often.
            let time = new Date().getTime();
            if(event === 'change' && time - openedFiles[type].lastTime > 500) {
                // Re-calculate hash value of the file.
                // HACK: Wait a bit in order to avoid racing conditions (between the external program and the hash algorithm).
                setTimeout(() => sha1File(filePath, (err2, newSha1) => {
                    // Compare hash value (i.e. check content is different).
                    if(!err2 && openedFiles[type].sha1 != newSha1) {
                        // Send notification to UI.
                        mainWindow.webContents.send('file-changed', {
                            'type': type, 
                            'path': filePath,
                            'name': fileName,
                        });

                        openedFiles[type].lastTime = time;
                    }
                }), 500);
            }
        });
    });
}

// Helper function for ensure that a file has extension.
function checkFileExtension(filePath) {
    if(!path.extname(filePath)) {
        let ext = null;
        for (let key in openedFiles) {
            if(!ext && openedFiles[key] && openedFiles[key].path) {
                ext = path.extname(openedFiles[key].path);
            }
        }
        return filePath + (ext || '.txt');
    }
    return filePath;
}

// Helper function for support reading files with and unknown encoding.
function readFileWithAnyEncoding(filePath, callback) {
    // Read file for detect his encoding.
    fs.readFile(filePath, function (err, rawBuffer) {
        // Verify if the file was read.
        if (!err) {
            // Detect file encoding.
            let encoding = Utils.convertChardetEncoding(jschardet.detect(rawBuffer).encoding || 'UTF-8');

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

// Read a file and send the corresponding events.
function readAndParseFile(event, filePath, type) {
    // Read file.
    readFileWithAnyEncoding(filePath, function (err, fileData, encoding) {
        // Verify if the file was read.
        if (!err) {
            // Store file's path and data.
            storeFileData(type, filePath, encoding);

            // Return data.
            let fileReadData = {
                path: filePath,
                name: path.basename(filePath),
                text: fileData,
                encoding: encoding,
            };

            event.sender.send('file-read', {'error': null, 'data': fileReadData, 'type': type});
        } else {
            // Return error.
            event.sender.send('file-read', {'error': {'code': "UNEXPECTED_ERROR", 'message': err}, 'data': null, 'type': type});
        }
    });
};

// Open and read a text file.
ipcMain.on('open-file', function(event, type) {
    // Show file chooser..
    let files = dialog.showOpenDialog({ properties: ['openFile']});

    // Verify if the file was selected.
    if(files != null && files.length > 0) {
        // Read file.
        readAndParseFile(event, files[0], type);
    } else {
        // Return error.
        event.sender.send('file-read', {'error': {'code': "NO_FILE_SELECTED", 'message': "No file was selected"}, 'data': null, 'type': type});
    }
});

// Re-open and read a text file.
ipcMain.on('reopen-file', function(event, type) {
    // Verify if the path is defined.
    let path = openedFiles[type] ? openedFiles[type].path : null;
    if(path) {
        // Read file.
        readAndParseFile(event, path, type);
    } else {
        // Return error.
        event.sender.send('file-read', {'error': {'code': "NO_FILE_AVAILABLE", 'message': "The file couldn't be reloaded"}, 'data': null, 'type': type});
    }
});

// Verify if a file already opened can be read.
ipcMain.on('last-file', function(event, type) {
    let filePath = settingsStore.get('app.' + type + 'File');
    if(filePath) { readAndParseFile(event, filePath, type); }
});

// Saves a text file.
ipcMain.on('save-file', function(event, type, filePath, data, encoding) {
    // Set default extension (if need).
    filePath = checkFileExtension(filePath);

    // Stop watching changes on the file (otherwise the app will self-trigger the listener).
    if(openedFiles[type] && openedFiles[type].watcher) {
        try{ openedFiles[type].watcher.close(); }catch(watErr) { console.log(watErr); }
        openedFiles[type].watcher = null;
    }

    // Save file.
    fs.writeFile(filePath, data, encoding || 'UTF-8', function(err) {
        // Return result.
        event.sender.send('file-saved', {
            'type': type, 
            'err': err,
            'path': filePath,
            'name': path.basename(filePath),
        });

        // Store file's path and data.
        storeFileData(type, filePath, encoding)
    });
});

// Ask user to select a path and then saves a text file.
ipcMain.on('save-file-as', function(event, type, data, encoding) {
    // Read file.
    let filePath = dialog.showSaveDialog();

    // Verify if the file was selected.
    if(filePath) {
        // Set default extension (if need).
        filePath = checkFileExtension(filePath);

        // Save file.
        fs.writeFile(filePath, data, encoding || 'UTF-8', function(err) {
            // Return result.
            event.sender.send('file-saved', {
                'type': type, 
                'err': err,
                'path': filePath,
                'name': path.basename(filePath),
            });

            // Store file's path and data.
            storeFileData(type, filePath, encoding);
        });
    } else {
        // Return error.
        event.sender.send('file-saved', {'type': type, 'err': "No file was selected"});
    }
});


// --- Spell check --- //

const nodehun = require('nodehun');
let Dictionaries = {};
let ActiveLang = 'en_US';

function readDictionaryFiles(lang, callback) {
    let result = {};
    let error = null;
    let count = 0;

    const exts = ['aff', 'dic'];
    exts.forEach(function (ext, index) {
        fs.readFile(path.join(__dirname, '/resources/dict/'+lang+'.'+ext), function (err, data) {
            if(err) {
                error = err;
            } else {
                result[ext] = data;
            }

            ++count;
            if(count == exts.length) {
                callback(error, result);
            }
        });
    });
}

// Event for load a dictionary.
ipcMain.on('dictionary.load', function(event, lang) {
    // Verify if the dictionary is not already loaded.
    if(Dictionaries[lang] == null) {
        try {
            // Load dictionary.
            readDictionaryFiles(lang, (err, data) => {
                if(!err && data) {
                    Dictionaries[lang] = new nodehun(data.aff, data.dic);
                }

                // Return result.
                event.sender.send('dictionary.loaded', {'error': err, 'success': !!data});              
            })
        } catch(err) {
            // Return error message.
            event.sender.send('dictionary.loaded', {'error': err, 'success': false});
        }
    } else {
        // Return success message.
        event.sender.send('dictionary.loaded', {'error': null, 'success': true});
    }
});

// Check a word in a loaded dictionary.
ipcMain.on('dictionary.check-word', function(event, lang, word) {
    let res = null;
    if(lang != null && Dictionaries[lang] != null && word != null) {
        res = Dictionaries[lang].isCorrectSync(word);
    }
    event.returnValue = res;
});

// Check a word in a loaded dictionary.
ipcMain.on('dictionary.set-active-lang', function(event, lang) {
    ActiveLang = lang;
    event.returnValue = true;
});


// --- Context menu (for copy/paste and for suggest misspelled words) --- //

const electronContextMenu = require('electron-context-menu');
const MAX_SUGGESTIONS = 5;

electronContextMenu({
    prepend: function(params, browserWindow) {
        let menuItems = [];

        // If it's an editable text and there is a word misspelled, show suggestions.
        if(params.isEditable && params.misspelledWord && ActiveLang != null && Dictionaries[ActiveLang] != null) {
            let suggestions = Dictionaries[ActiveLang].spellSuggestionsSync(params.misspelledWord);
            for(let i=0; i<suggestions.length && i<MAX_SUGGESTIONS; i++) {
                let word = suggestions[i];
                menuItems.push({
                    label: word,
                    click: function() {
                        mainWindow.webContents.send('paste-misspelled', word);
                    },
                });
            }
        }

        return menuItems;
    }
});


// --- Supported languages --- //

// Get the list of supported languages.
ipcMain.on('get-languages', function(event) {
    // Read languages file.
    let fileContent = fs.readFileSync(__dirname  + '/misc/languages.json');
    let langData = JSON.parse(fileContent);
    let res = langData.list;

    // Verify support of automatic translation.
    for(let provider in langData.translation) {
        for(let i=0; i<res.length; i++) {
            res[i][provider] = langData.translation[provider].indexOf( res[i].code ) >= 0;
        }
    }

    // Verify support for spellcheck.
    for(let i=0; i<res.length; i++) {
        res[i].spellcheck = langData.spellchecker[res[i].code]? langData.spellchecker[res[i].code] : false;
    }

    // Sort by name (instead of by code).
    res.sort(function(a, b) { return a.name < b.name? -1 : 1; });

    // Return result.
    event.returnValue = res;
});


// --- Translation cache --- //

const NodeCache = require("node-cache");
const translationCache = new NodeCache({ stdTTL: 7200, checkperiod: 1200 });

const crypto = require('crypto');
function sha1(data) {
    let generator = crypto.createHash('sha1');
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


// --- Miscellaneous --- //

// Get the current platform.
ipcMain.on('get-platform', function(event) {
    event.returnValue = process.platform;
});

// Check if the app is running on development mode.
ipcMain.on('is-dev', function(event) {
    event.returnValue = isDev;
});
