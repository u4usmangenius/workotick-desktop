import {
  app,
  BrowserWindow,
  desktopCapturer,
  ipcMain,
  Menu,
  nativeImage,
  net,
  Notification,
  powerMonitor,
  shell,
} from "electron";
import { uIOhook } from "uiohook-napi";
import path from "path";
import moment from "moment";
import ActiveWindow from "@paymoapp/active-window";
import { Screenshot } from "./renderer/types/Screenshot";
import { Activities } from "./renderer/types/Activities";
import * as fs from "fs";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

let isClockedIn = false;
let activities: Activities[] = [];
let isSleep = false;
let project_id: string;
let memo: string;

// Access the logo.png file
const appIcon = nativeImage.createFromPath(path.join(__dirname, "/logo.png"));
const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    icon: appIcon,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  // Create an empty menu
  const menu = Menu.buildFromTemplate([]);
  //mainWindow.webContents.openDevTools();
  // Set the application menu
  Menu.setApplicationMenu(menu);

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
  if (process.platform == "win32") {
    app.setAppUserModelId("Workotick");
  }

  mainWindow.on("close", (event) => {
    if (isClockedIn && net.isOnline()) {
      event.preventDefault();
      mainWindow.webContents.send(
        "show-message",
        "Please clock out first before quiting"
      );
    } else {
      app.quit();
    }
  });

  ipcMain.on("clockIn", () => {
    isClockedIn = true;
    startIOHook();
  });

  ipcMain.handle("openLinkPlease", (event, url) => {
    shell.openExternal(url);
  });

  ipcMain.on("memo", (event, data) => {
    project_id = data.project_id;
    memo = data.memo;
  });
  ipcMain.on("internet-disconnect", (event) => {
    isClockedIn = false;
  });

  ipcMain.on("show-notification", (event, title, message) => {
    if (!isSleep) {
      const notification = new Notification({
        title: title,
        body: message,
        urgency: "critical",
        icon: appIcon,
      });

      notification.on("click", () => {
        // Bring the app window into focus when notification is clicked
        if (mainWindow) {
          mainWindow.show();
        }
      });

      notification.show();
    }
  });

  ipcMain.on("clockOut", () => {
    isClockedIn = false;
    (project_id = null), (memo = null);
    stopIOHook();
  });

  powerMonitor.on("suspend", () => {
    mainWindow.webContents.send("clock-out");
    isClockedIn = false;
    isSleep = true;
  });

  powerMonitor.on("resume", () => {
    const notification = new Notification({
      title: "Clock in",
      body: "You have been clocked out. Clock in again to track your progress",
      urgency: "critical",
      icon: appIcon,
    });

    notification.on("click", () => {
      // Bring the app window into focus when notification is clicked
      if (mainWindow) {
        mainWindow.show();
      }
    });
    isSleep = false;
    setTimeout(function () {
      notification.show();
    }, 5000);
  });

  ipcMain.on("clear-memo", () => {
    (project_id = null), (memo = null);
  });
  ipcMain.on("take-screenshot", () => {
    const time = moment().format("MMMM Do YYYY, h:mm:ss a");

    desktopCapturer
      .getSources({
        types: ["screen"],
        thumbnailSize: {
          height: 920,
          width: 1200,
        },
      })
      .then((sources) => {
        const dataURL = sources[0].thumbnail.toDataURL();
        const base64Data = dataURL.replace(
          /^data:image\/(png|jpeg|jpg);base64,/,
          ""
        );

        ActiveWindow.initialize();

        if (!ActiveWindow.requestPermissions()) {
          console.log(
            "Error: You need to grant screen recording permission in System Preferences > Security & Privacy > Privacy > Screen Recording"
          );
          process.exit(0);
        }

        const activeWin = ActiveWindow.getActiveWindow();
        const requestData: Screenshot = {
          title: activeWin.application,
          project_id: project_id ? project_id : "",
          memo: memo ? memo : "",
          image: base64Data,
          captured_at: time,
          activities: activities,
        };

        mainWindow.webContents.send("screenshot-data", requestData);
        activities = [];
      });
  });
};

const startIOHook = () => {
  uIOhook.on("keydown", (e) => {
    activities.push({ type: "keydown", captured_at: new Date() });
  });
  uIOhook.on("click", (e) => {
    activities.push({ type: "click", captured_at: new Date() });
  });
  uIOhook.start();
};

const stopIOHook = () => {
  uIOhook.removeAllListeners("keydown");
  uIOhook.removeAllListeners("click");
  uIOhook.stop();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
