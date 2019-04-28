
const { app, BrowserWindow, Menu } = require('electron');
const DEV = 0;


function createWindow() {
    let win = new BrowserWindow({
        width: 1200, height: 720,
        minWidth: 800, minHeight: 600
    })

    win.loadFile('index.html');

    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Open Folder',
                    click(menuItem, browserWindow, event) {
                        win.webContents.send('menu-folder-select');
                    }
                },
                { type: 'separator' },
                { role: 'quit' }
            ]
        }
    ];
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    // TODO: use command line option to enable/disable dev tools
    // DEV
    if (DEV) {
        win.webContents.openDevTools();
    }
}

app.on('ready', createWindow)


