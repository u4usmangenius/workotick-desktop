// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { IpcRendererEvent, contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("ipc", {
  captureScreenshot: () => ipcRenderer.send("take-screenshot"),
  clearMemo: () => ipcRenderer.send("clear-memo"),
  getScreenshot: (callback: (event: IpcRendererEvent, data: object) => void) =>
    ipcRenderer.on("screenshot-data", callback),
  showNotification: (title: string, message: string) =>
    ipcRenderer.send("show-notification", title, message),
  internetDisconnect: () => ipcRenderer.send("internet-disconnect"),
  clockedOut: (callback: (event: IpcRendererEvent) => void) =>
    ipcRenderer.on("clock-out", callback),
  showMessage: (callback: (event: IpcRendererEvent, data: string) => void) =>
    ipcRenderer.on("show-message", callback),
  removeListener: () => ipcRenderer.removeAllListeners("screenshot-data"),
  clockIn: () => ipcRenderer.send("clockIn"),
  clockOut: () => ipcRenderer.send("clockOut"),
  sendMemo: (data: object) => ipcRenderer.send("memo", data),
  openLinkPlease: (url: string) => ipcRenderer.invoke("openLinkPlease", url),
});
