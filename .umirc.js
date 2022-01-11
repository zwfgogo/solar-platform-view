const theme = require('./src/theme')
const path = require('path')
let webpack = require('webpack')
let CodeAssistantPlugin = require('wanke-tools/packages/webpack-plugins/CodeAssistancePlugin')
let AutoExportColumn = require('wanke-tools/packages/webpack-plugins/AutoExportColumn')
let CaseSensitivePathPlugin = require('case-sensitive-paths-webpack-plugin')
import storageConfig from './src/config-storage/config'
import terminalConfig from './src/config-terminal/config'
import pvConfig from './src/config-pv/config'
import screenConfig from './src/config-big-screen/config'
import batteryConfig from './src/config-battery/config'
import multiScreenConfig from './src/config-multi-screen/config'
import microgridConfig from './src/config-microgrid/config'

let config
if (process.env.SYSTEM_PLATFORM === 'storage') {
  config = storageConfig
} else if (process.env.SYSTEM_PLATFORM === 'terminal') {
  config = terminalConfig
} else if (process.env.SYSTEM_PLATFORM === 'pv') {
  config = pvConfig
} else if (process.env.SYSTEM_PLATFORM === 'screen') {
  config = screenConfig
} else if(process.env.SYSTEM_PLATFORM === 'battery'){
  config = batteryConfig
}else if(process.env.SYSTEM_PLATFORM === 'multiScreen'){
  config = multiScreenConfig
}else if(process.env.SYSTEM_PLATFORM === 'microgrid'){
  config = microgridConfig
}else {
  throw new Error('unknown SYSTEM_PLATFORM: ' + process.env.SYSTEM_PLATFORM)
}

const umiConfig = {
  chunks: ['manifest', 'vendors', 'umi'],
  hash: true,
  // ant配置项
  antd: false,
  dva: {
    skipModelValidate: true
  },
  // 按需加载
  dynamicImport: {},
  proxy: {
    '/api/': {
      'target': 'http://192.168.2.35:4060/',
      'changeOrigin': true,
      'pathRewrite': {
        '^/api/': ''
      }
    },
    '/api-vpp/': {
      target: 'http://192.168.2.35:4056/',
      changeOrigin: true,
      pathRewrite: {
        '^/api-vpp/': ''
      }
    },
    '/api-screen/': {
      target: 'http://192.168.2.35:5007/',
      changeOrigin: true,
      pathRewrite: {
        '^/api-screen/': ''
      }
    }
  },
  copy: ['./src/static/echarts.min.js', './src/static/dataTool.js', './src/static/d3.v5.min.js'],
  theme: theme,
  externals: {
    d3: 'window.d3',
    echarts: 'window.echarts'
  },
  chainWebpack(config, {
    webpack
  }) {
    config.merge({
      optimization: {
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              name: 'vendors',
              test: /[\\/]node_modules[\\/]/,
              priority: 10
            }
          }
        },
        runtimeChunk: {
          name: 'manifest'
        }
      }
    })
    config.module
      .rule('doc')
      .test(/\.((docx?)|(xlsx))$/)
      .exclude
      .add([path.resolve('node_modules')])
      .end()
      .use('file-loader')
      .loader(require.resolve('file-loader'))
      .options({
        name: '[name].[hash:8].[ext]',
        outputPath: 'static/',
        esModule: false
      })
    config.module
      .rule('mp3')
      .test(/\.(mp3)$/)
      .exclude
      .add([path.resolve('node_modules')])
      .end()
      .use('url-loader')
      .loader(require.resolve('url-loader'))
      .options({
        name: '[name].[hash:8].[ext]',
        outputPath: 'static/',
        esModule: false
      })
    config.plugin('IgnorePlugin').use(webpack.IgnorePlugin, [/^\.\/locale$/, /moment$/])
    config.plugin('CodeAssistant').use(CodeAssistantPlugin)
    config.plugin('CaseSensitivePathPlugin').use(CaseSensitivePathPlugin)
    // config.plugin('FindModulePlugin').use(FindModulePlugin, [{subDir: 'src', isIgnore}])
    // 添加auto-column注释，自动生成导出的column定义
    config.plugin('AutoExportColumn').use(AutoExportColumn)
  },
  extraBabelPlugins: [
    ['babel-plugin-import', {
      libraryName: 'wanke-icon',
      libraryDirectory: 'lib/icons',
      camel2DashComponentName: false
    }]
  ],
  targets: {
    ie: 11
  },
  ...config
}

umiConfig.routes.forEach(firstRoute => {
  if (firstRoute.routes) {
    firstRoute.routes.forEach(route => {
      if (!route.component) {
        route.component = '../frameset/PostPageId'
      }
    })
  }
})

export default umiConfig
