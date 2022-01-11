import moment from 'moment'
import './public/antd.dark.css';
import './public/antd.light.css';
import './static/platform-app.less';
import './static/common.less';
import './static/reset.less';
import './frameset/system-info.less';
import './static/theme-light.less'
import './static/theme-dark.less'
import './global.less'
import 'moment/locale/zh-cn'
import createLoading from 'dva-loading'
import {isDev, isZh} from './core/env'
import {message} from 'wanke-gui'
import createSuccess from './createSuccess'
import gdata from './public/js/gdata'
import enUSJson from './public/locale/en_US.json'
import zhCNJson from './public/locale/zh_CN.json'

if (isZh()) {
  moment.locale('zh-cn')
}

let messages = {}
messages['en'] = enUSJson
messages['zh'] = zhCNJson
gdata('languageMessages', messages[localStorage.getItem('language') || 'zh'] || {})

if (isDev()) {
  message.config({
    maxCount: 3
  })
} else {
  message.config({
    maxCount: 1
  })
}

export const dva = {
  plugins: [
    createSuccess(),
    {
      onEffect(effect) {
        // effect统一异常处理
        return function* (...args) {
          try {
            yield effect(...args)
          } catch (e) {
            console.error(e)
          }
        }
      }
    },
    createLoading()
  ]
}
