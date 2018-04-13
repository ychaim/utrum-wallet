import { app, BrowserWindow, Menu, shell } from 'electron';
import ElectrumManager from './electrumManager';

const electrumManager = new ElectrumManager();

require('electron-debug')({ showDevTools: true });
const path = require('path');
const ipc = require('electron').ipcMain;
const http = require('http');
const copyright = require('./copyright.json');
const pkg = require('../../package.json');

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\');
}

let mainWindow;
const winURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:9080'
  : `file://${__dirname}/index.html`;


let win;
/**
 * Create windows electron for open terms and conditions.
 * @returns {null} None
 */
function termsAndConditions() {
  const winUrl = process.env.NODE_ENV === 'development'
  ? 'http://localhost:9080/#/termsAndConditions'
  : `file://${__dirname}/index.html#termsAndConditions`;

  if (win) {
    win.close();
  }
  win = new BrowserWindow({
    width: 600, 
    height: 800,
    minWidth: 600,
    minHeight: 800,
    maxWidth: 600,
    maxHeight: 800,
    title: "Terms And Conditions",
    fullscreenWindowTitle: false,
  });
  win.on('closed', () => {
    win = null
  })

  win.loadURL(winUrl)
}

/**
 * Create windows electron for open disclamer.
 * @returns {null} None
 */
function disclamer() {
  const winUrl = process.env.NODE_ENV === 'development'
  ? 'http://localhost:9080/#/disclamer'
  : `file://${__dirname}/index.html#disclamer`;

  if (win) {
    win.close();
  }
  win = new BrowserWindow({
    width: 600, 
    height: 800,
    minWidth: 600,
    minHeight: 800,
    maxWidth: 600,
    maxHeight: 800,
    title: "Disclamer",
    fullscreenWindowTitle: false,
  });
  win.on('closed', () => {
    win = null
  })

  win.loadURL(winUrl)
}

/**
 * Create windows electron with specifications.
 * @returns {null} None
 */
function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    // useContentSize: true,
    // titleBarStyle: 'hidden',
    // transparent: true, frame: false,
    center: true,
    width: 1100,
    height: 650,
    minWidth: 1000,
    minHeight: 600,
    // nodeIntegration: 'iframe', // and this line
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
    },
  });

  app.setAboutPanelOptions({
    applicationVersion: pkg.version,
    version: process.type
  })

  mainWindow.webContents.openDevTools();
  const template = [{
    label: 'Monaize ICO App',
    submenu: [
        { label: 'About Monaize ICO App', selector: 'orderFrontStandardAboutPanel:' },
        { label: 'Terms and Conditions', click: function () { termsAndConditions() } },
        { label: 'Disclamer', click: function () { disclamer() } },
        { label: 'Monaize ICO WebSite', click: function () { shell.openExternal('https://monaize.com/#/uk/ico'); } },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'Command+Q', click: function () { app.quit(); } },
    ] }, {
      label: 'Edit',
      submenu: [
          { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
          { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
          { type: 'separator' },
          { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
          { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
          { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
          { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
      ] },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  ipc.on('console', function (ev) {
    const args = [].slice.call(arguments, 1);
    const r = console.log.apply(console, args);
    ev.returnValue = [r];
  });
  ipc.on('app', function (ev, msg) {
    const args = [].slice.call(arguments, 2);
    ev.returnValue = [app[msg].apply(app, args)];
  });
  
  ipc.on('electrum.init', (event, payload) => {
    electrumManager.initClient(payload.ticker, payload.electrumConfig)
      .then((response) => {
        event.sender.send(`electrum.init.${payload.ticker}.${payload.tag}`, response);
      })
      .catch((error) => {
        event.sender.send(`electrum.init.${payload.ticker}.${payload.tag}`, {error});
      })
    ;
  });

  ipc.on('electrum.call', (event, payload) => {
    electrumManager.requestClient(payload.ticker, payload.method, payload.params)
      .then((response) => {
        event.sender.send(`electrum.call.${payload.method}.${payload.ticker}.${payload.tag}`, response);
      })
      .catch((error) => {
        event.sender.send(`electrum.call.${payload.method}.${payload.ticker}.${payload.tag}`, {error});
      })
    ;
  });

  mainWindow.loadURL(winURL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
