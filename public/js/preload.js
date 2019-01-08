// Save references to Electron modules.
var _process = process;
var _require = require;

// Inject back Electron modules after loaded.
process.once('loaded', function() {
    global.process = _process;
    global.require = _require;
});
