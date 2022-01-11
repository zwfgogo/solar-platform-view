/**
 * 检查是否提交了 .umirc.js ，禁止提交这个文件
 */
const path = require('path')
const {spawn, exec} = require('child_process')

exec('git diff --cached --stat', {cwd: path.join(__dirname, '../')}, function (err, output, stderr) {
  if (output.indexOf('.umirc.js') !== -1) {
    console.log('禁止提交 .umirc.js !')
    process.exit(1)
  } else {
    exec('git diff --cached ', {cwd: path.join(__dirname, '../')}, function (err, output1, stderr) {
      // if (output1.indexOf('//local') !== -1) {
      //   console.log(`请处理//local:  ((( ${findCodePreview(output1, '//local')}  ))) `)
      //   process.exit(1)
      // }
    })
  }
})

function findCodePreview(code, match) {
  if (!code) {
    return null
  }
  if (code.indexOf(match) == -1) {
    return null
  }
  let index1 = code.indexOf('//local')
  let startIndex = index1 - 10 >= 0 ? index1 - 10 : 0
  let endIndex = index1 + 10 < code.length ? index1 + 10 : code.length - 1
  let codePreview = code.substring(startIndex, endIndex)
  return '\n' + codePreview + '\n'
}
