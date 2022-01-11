export function isDev() {
  return process.env.NODE_ENV == 'development'
}

export function getSystemTheme() {
  return localStorage.getItem('theme') || 'light-theme'
}

export function setSystemTheme(theme) {
  return localStorage.setItem('theme', theme)
}

export function getPublic() {
  return window.publicPath
}

export const showWidthInfo = false

export function isTerminalSystem() {
  return process.env.SYSTEM_PLATFORM == 'terminal'
}

export function isPvSystem() {
  return process.env.SYSTEM_PLATFORM == 'pv'
}

export function isBigScreenSystem() {
  return process.env.SYSTEM_PLATFORM == 'screen'
}

export function isStorageSystem() {
  return process.env.SYSTEM_PLATFORM == 'storage'
}

export function isBatterySystem(){
  return process.env.SYSTEM_PLATFORM == 'battery'
}

export function isMultiScreen(){
  return process.env.SYSTEM_PLATFORM == 'multiScreen'
}

export function isMicrogrid(){
  return process.env.SYSTEM_PLATFORM == 'microgrid'
}

export function getSystemName() {
  return process.env.SYSTEM_PLATFORM
}

export function isZh() {
  let language = localStorage.getItem('language') || 'zh'
  return language == 'zh'
}
