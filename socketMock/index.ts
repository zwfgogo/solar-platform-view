// @ts-ignore
const modulesFiles = require.context('.', false, /.ts$/)
const modules = modulesFiles.keys().reduce((modules, modulePath) => {
  const moduleName = modulePath.replace(/^.\/(.*)\.ts/,'$1')
  if(moduleName === 'index') return modules;
  const value = modulesFiles(modulePath)
  if(value.default?.namespace) {
    modules[value.default.namespace] = value.default;
  }
  return modules;
}, {})

export const getSocketMock = () => {
  return modules;
}

/* mock文件格式
export default {
  namespace: '/overview',
  events: {
    'summary': {
      // emit之后返回的第一个数据
      init: (params) => ({
        results: summaryResults
      }),
      // 轮询返回的数据
      loop: (index: number, params) => ({
        results: summaryResults
      }),
      timeout: 10000, // 轮询间隔 非必填
      delay: 500, // 触发事件延时 非必填
    },
  }
}
*/
