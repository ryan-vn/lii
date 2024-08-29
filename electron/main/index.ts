import { app, BrowserWindow, shell,dialog, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import { update } from './update'
import fs from 'fs'
import chokidar from 'chokidar'
import crypto from 'crypto'
import {readLuaToJson, extractAndTransform} from '../utils/parse'
import{spawn} from 'child_process'

const require = createRequire(import.meta.url)

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 获取用户数据目录路径
const userDataPath = app.getPath('userData');
// 定义配置文件路径
const configPath = path.join(userDataPath, 'config.json');

const DB_Path = path.join(userDataPath, 'db.json');


function calculateFileHash(filePath: string, algorithm = 'sha256') {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);
    const stream = fs.createReadStream(filePath);
    stream.on('data', (data) => {
      hash.update(data, 'utf8');
    });
    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });
    stream.on('error', (err) => {
      reject(err);
    });
  });
}

let send = false

async function autoWatchPreviouslySelectedFile() {
  const r = readDB()
  const config = readConfig(); // 读取配置文件
  const selectedFilePath = config.selectedFilePath; // 获取之前用户选择的文件路径

  // 检查文件路径是否存在
  if (selectedFilePath && fs.existsSync(selectedFilePath)) {
    // 设置chokidar监听文件变化
    const config = readConfig(); // 读取配置文件
    const selectedFilePath = config.selectedFilePath; // 获取之前用户选择的文件路径
    const watcher = chokidar.watch(selectedFilePath, {
      persistent: true
    });

    // const j = await readLuaToJson(selectedFilePath);

    // const time_stamp = j['AUCTIONATOR_SAVEDVARS']['TimeOfLastGetAllScan']

    // const json = j['AUCTIONATOR_PRICE_DATABASE']

    // console.log('time_stamp', time_stamp)
    
    // Object.keys(json).forEach(i => {
    //   const server = json[i]
    //   if(typeof server === 'object'){
    //     const arr = Object.entries(server).map(([key, value]) => ({ key, price: value.m }));
    //     console.log('arr',i, arr.length)
    //   }
    // })
    watcher.on('change', async(path) => {
      // console.log(`File ${path} has been changed`);
  
      // const j = await readLuaToJson(selectedFilePath);

      // const json = j['AUCTIONATOR_PRICE_DATABASE']
      // console.log('json', json)

    // const p = Object.keys(json).map((i) => ({
    //   name: i,
    //   id: i,
    //   data: extractAndTransform(json[i]),
    // }));

    // const d = {
    //   Horde: p,
    // };

      // fs.writeFileSync(DB_Path, JSON.stringify(d, null, 2), 'utf8');
      // sendFileContentToRenderer(JSON.stringify(j['AUCTIONATOR_PRICE_DATABASE']['龙牙 Horde'])); 
      // send = true

    });

  } else {
    // console.log('No valid file path found in config to watch.');
  }
}


// 使用示例
// const filePath = '/path/to/your/file';

// calculateFileHash(filePath).then((hash) => {
//   console.log(`文件哈希值: ${hash}`);
// }).catch((error) => {
//   console.error(`计算哈希值时出错: ${error}`);
// });




// 检查配置文件是否存在，不存在则创建
function ensureConfigExists() {
  if (!fs.existsSync(configPath)) {
    // 配置文件不存在，创建一个默认配置文件
    saveConfig({ selectedFilePath: '', fileHash: '' });
  }
}

function ensureDBExists() {
  if (!fs.existsSync(DB_Path)) {
    // 配置文件不存在，创建一个默认配置文件
    saveDB();
  }
}

function readDB() {
  ensureDBExists(); // 确保配置文件存在
  try {
    return JSON.parse(fs.readFileSync(DB_Path, 'utf8'));
  } catch (error) {
    console.log('Error reading config file:', error);
    return {};
  }
}

function saveDB() {
  try {
    fs.writeFileSync(DB_Path, "{}", 'utf8');
  } catch (error) {
    console.log('Error writing config file:', error);
  }
}

// 读取配置文件
function readConfig() {
  ensureConfigExists(); // 确保配置文件存在
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    console.log('Error reading config file:', error);
    return {};
  }
}

// 保存配置到文件
function saveConfig(config: object) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  } catch (error) {
    console.log('Error writing config file:', error);
  }
}


// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    title: 'Main window',
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) { // #298
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  update(win)
}

let jsonServerProcess: any;
app.whenReady().then(async() => {
  await autoWatchPreviouslySelectedFile(); // 添加这一行来自动监听文件
  createWindow();

 try{
  // jsonServerProcess = spawn('json-server', ['--watch', DB_Path, '--port', '3000']);

  // jsonServerProcess.stdout.on('data', (data) => {
  //   console.log(`stdout: ${data}`);
  // });
  
  // jsonServerProcess.stderr.on('data', (data) => {
  //   console.error(`stderr: ${data}`);
  // });
  
  // jsonServerProcess.on('close', (code) => {
  //   console.log(`child process exited with code ${code}`);
  // });
 }catch (error) {
  console.log('err', error)
 }
});

app.on('window-all-closed', () => {
  win = null
  jsonServerProcess.kill?.();
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})


// ipcMain.on('start-watch-lua-file', (event) => {
//   const config = readConfig(); // 读取配置文件
//   const selectedFilePath = config.selectedFilePath; // 获取之前用户选择的文件路径
//   const watcher = chokidar.watch(selectedFilePath, {
//     persistent: true
//   });

//   if(readConfig().selectedFilePath && readConfig().selectedFilePath !==selectedFilePath){
//     watcher.unwatch(readConfig().selectedFilePath);
//     saveConfig({ selectedFilePath: '' });
//   }
//   saveConfig({ selectedFilePath: selectedFilePath });

//   watcher.on('change', (path) => {
//     console.log(`File ${path} has been changed`);
//     event.sender.send('file-changed', path);
//   });
// })

ipcMain.on('open-file-dialog', (event) => {
  dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Lua Files', extensions: ['lua'] }]
  }).then(async result => {
    if (!result.canceled && result.filePaths.length > 0) {
      // 发送选中的文件路径回渲染进程
      event.sender.send('selected-file', result.filePaths[0]);

      // 保存选中的文件路径到配置文件

      // 监听文件变化
      const watcher = chokidar.watch(result.filePaths[0], {
        persistent: true
      });

      if(readConfig().selectedFilePath && readConfig().selectedFilePath !==result.filePaths[0]){
        watcher.unwatch(readConfig().selectedFilePath);
        saveConfig({ selectedFilePath: '' });
      }
      saveConfig({ selectedFilePath: result.filePaths[0] });

      watcher.on('change', (path) => {
        console.log(`File ${path} has been changed`);
        event.sender.send('file-changed', path);
      });
    }
  }).catch(err => {
    console.log(err);
  });
});