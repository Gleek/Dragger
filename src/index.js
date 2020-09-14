const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
// Drag and drop crashes on linux
app.disableHardwareAcceleration();
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // es lint-disable-line global-require
  app.quit();
}


// // Keep a global reference of the window object, if you don't, the window will
// // be closed automatically when the JavaScript object is garbage collected.
// let mainWindow;

const getFileObj = (file) => {
  const fullPath = path.resolve(file);
  return {
    path: fullPath,
    name: path.basename(fullPath),
    ext: path.extname(fullPath).substr(1),
    type: fs.lstatSync(fullPath).isDirectory() ? 'directory' : 'file'
  };
  // return app.getFileIcon(file, {size: 'normal'}, (error, icon) => {
  //   callback();
  // });
};


const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 150,
    height: 400,
    // transparent: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true
    }
  });

  let files = process.argv.slice(1).map(file => {
    return getFileObj(file);
  });
  // mainWindow.webContents.send('files', files);

  ipcMain.on('ready', (event, arg) => {
    event.sender.send('files', files);
  });
  ipcMain.on('ondragstart', (event, filePath) => {
    console.log("filePath", filePath);
    event.sender.startDrag({
      file: filePath,
      icon: `${__dirname}/file.png`
    });
    // app.getFileIcon(filePath, {size: 'normal'}, (error, icon) => {
    //   const dragFile = '/tmp/dragger-drag.png';
    //   fs.writeFile(dragFile, icon.toPNG(), (err) => {
    //     if (err) {
    //       console.error("save err", err);
    //       return;
    //     }
    //     event.sender.startDrag({
    //       file: filePath,
    //       // icon: `${__dirname}/fontawesome/pngs/file.png`
    //       icon: dragFile
    //     });
    //   });
    // });
  });

  ipcMain.on('update_files', (event, fileList) => {
    files = fileList.map(file => getFileObj(file));
    event.sender.send('files', files);
  });

  ipcMain.on('dropped_files', (event, fileList) => {
    fileList.forEach(file => {
      files.push(getFileObj(file));
    });
    event.sender.send('files', files);
  });



  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  mainWindow.webContents.openDevTools();

  // mainWindow.setVisibleOnAllWorkspaces(true);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools({mode: "detach"});

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    // mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
