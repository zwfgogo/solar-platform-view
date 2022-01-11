// @ts-ignore
const modulesFiles = require.context('../../static/img/verify-img', false, /\.png$/)
const modules = modulesFiles.keys().reduce((modules, modulePath) => {
  const moduleName = modulePath.replace(/^.\/(.*)\.png/,'$1')
  modules.push(require(`../../static/img/verify-img/${moduleName}.png`))
  return modules;
}, [])

export const getImageList = () => {
  return modules;
}
