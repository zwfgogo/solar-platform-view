const fs = require('fs')
const path = require('path')

let systemPlatform = process.env.SYSTEM_PLATFORM

let prefixTerminal = './src/config-terminal/'
let prefixStorage = './src/config-storage/'
let prefixPv = './src/config-pv/'
let prefixBigScreen = './src/config-big-screen/'
let prefixBattery = './src/config-battery/'
let prefixMultiScreen = './src/config-multi-screen/'
let prefixMicrogrid = './src/config-microgrid/'

let terminalList = [
  {from: prefixTerminal + '.env', to: './'},
  {from: prefixTerminal + '.umirc.local.js', to: '/'},
  {from: prefixTerminal + 'document.ejs', to: 'src/pages'},
  {from: prefixTerminal + 'models', to: 'src/'},
  {from: prefixTerminal + 'img', to: 'src/static', override: false},
]

let storageList = [
  {from: prefixStorage + '.env', to: './'},
  {from: prefixStorage + '.umirc.local.js', to: '/'},
  {from: prefixStorage + 'document.ejs', to: 'src/pages'},
  {from: prefixStorage + 'models', to: 'src/'},
  {from: prefixStorage + 'img', to: 'src/static', override: false},
]

let pvList = [
  {from: prefixPv + '.env', to: './'},
  {from: prefixPv + '.umirc.local.js', to: '/'},
  {from: prefixPv + 'document.ejs', to: 'src/pages'},
  {from: prefixPv + 'models', to: 'src/'},
  {from: prefixPv + 'img', to: 'src/static', override: false},
]

let bigScreenList = [
  {from: prefixBigScreen + '.env', to: './'},
  {from: prefixBigScreen + '.umirc.local.js', to: '/'},
  {from: prefixBigScreen + 'document.ejs', to: 'src/pages'},
  {from: prefixBigScreen + 'models', to: 'src/'},
  {from: prefixBigScreen + 'img', to: 'src/static', override: false},
]

let batteryList = [
  {from: prefixBattery + '.env', to: './'},
  {from: prefixBattery + '.umirc.local.js', to: '/'},
  {from: prefixBattery + 'document.ejs', to: 'src/pages'},
  {from: prefixBattery + 'models', to: 'src/'},
  {from: prefixBattery + 'img', to: 'src/static', override: false},
]

let multiScreenList = [
  {from: prefixMultiScreen + '.env', to: './'},
  {from: prefixMultiScreen + '.umirc.local.js', to: '/'},
  {from: prefixMultiScreen + 'document.ejs', to: 'src/pages'},
  {from: prefixMultiScreen + 'models', to: 'src/'},
  {from: prefixMultiScreen + 'img', to: 'src/static', override: false},
]

let microgridList = [
  {from: prefixMicrogrid + '.env', to: './'},
  {from: prefixMicrogrid + '.umirc.local.js', to: '/'},
  {from: prefixMicrogrid + 'document.ejs', to: 'src/pages'},
  {from: prefixMicrogrid + 'models', to: 'src/'},
  {from: prefixMicrogrid + 'img', to: 'src/static', override: false},
]

let buildDateFlag = false

function handleBuildDatetime(configPath) {
  if (!buildDateFlag) {
    return
  }
  let filePath = path.join(configPath, 'document.ejs')
  let content = fs.readFileSync(filePath).toString()
  content = content.replace(/buildDatetime (.*)/, (a,b)=> {
    return 'buildDatetime ' + new Date() + '-->'
  })
  fs.writeFileSync(filePath, content)
}

function start() {
  let list = []
  if (systemPlatform === 'terminal') {
    list = terminalList
  } else if (systemPlatform === 'storage') {
    handleBuildDatetime(path.join(__dirname, prefixStorage))
    list = storageList
  } else if (systemPlatform === 'pv') {
    handleBuildDatetime(path.join(__dirname, prefixPv))
    list = pvList
  } else if (systemPlatform === 'screen') {
    handleBuildDatetime(path.join(__dirname, prefixBigScreen))
    list = bigScreenList
  } else if (systemPlatform === 'battery') {
    list = batteryList
  } else if(systemPlatform === 'multiScreen'){
    list = multiScreenList
  } else if(systemPlatform === 'microgrid'){
    list = microgridList
  } else {
    console.error('无效 SYSTEM_PLATFORM')
    process.exit(1)
  }
  let envPath = path.join(__dirname, '.env')
  if (fs.existsSync(envPath)) {
    fs.unlinkSync(envPath)
  }
  list.forEach(item => {
    copy(path.join(__dirname, item.from), path.join(__dirname, item.to), item.override)
  })
}

function copy(from, to, override) {
  if (!fs.existsSync(from)) {
    return
  }
  if (fs.statSync(from).isDirectory()) {
    let parts = from.split(path.sep)
    let dist = path.join(to, parts[parts.length - 1])
    if (override !== false) {
      console.log(`删除目录：${dist.substring(__dirname.length + 1)}`)
      removeDir(dist)
    }
    reserveFile(from, (filePath1) => {
      copy(filePath1, dist)
    })
  } else {
    let info = path.parse(from)
    let content = fs.readFileSync(from)
    let toPath = path.join(to, info.base)
    fs.writeFileSync(toPath, content)
    console.log(`${from.substring(__dirname.length + 1).padEnd(50)} => ${toPath.substring(__dirname.length + 1)}`)
  }
}

function removeDir(dir) {
  if (fs.existsSync(dir)) {
    reserveFile(dir, (filePath) => {
      fs.unlinkSync(filePath)
    })
  } else {
    fs.mkdirSync(dir)
  }
}

start()

function reserveFile(dir, callback) {
  let list = fs.readdirSync(dir)
  list.forEach(function (fileName) {
    let filePath = path.join(dir, fileName)
    let stat = fs.statSync(filePath)
    if (stat && stat.isDirectory()) {
      // 递归子文件夹
      reserveFile(filePath, callback)
    } else {
      callback(filePath)
    }
  })
}
