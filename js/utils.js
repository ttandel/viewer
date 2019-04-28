const electron = require('electron');
const events = require('events');

module.exports.myEmitter = new events.EventEmitter();

function promptUserForDirectory () {
    var filePaths = electron.remote.dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (filePaths != undefined) {
        return filePaths[0]
    }
    else {
        return filePaths;
    }
};

module.exports.replaceStylesheet = function (stylesheetFilePath) {
    var appStyle = document.createElement('link');
    appStyle.rel = 'stylesheet';
    appStyle.type = 'text/css';
    appStyle.href = stylesheetFilePath;
    document.getElementsByTagName('head')[0].appendChild(appStyle);
}

module.exports.folderSelect = function () {
    testPath = promptUserForDirectory();
    if (testPath) {
        this.myEmitter.emit("folderSelected", testPath);
    }
}